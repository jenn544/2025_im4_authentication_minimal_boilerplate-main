<?php
// api/medikamente.php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: max-age=31536000, immutable');

require_once '../system/config.php';

// 1) Auth check
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}
$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Helper: input JSON parsen
function getJsonInput() {
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}

switch ($method) {
    case 'GET':
        // Medikamente + Logs ausliefern
        $stmt = $pdo->prepare("
            SELECT 
              m.id, m.name, m.dosage, m.frequency, m.time, m.weekday,
              GROUP_CONCAT(l.done_date) AS logs
            FROM medications m
            LEFT JOIN medication_logs l 
              ON l.medication_id = m.id
            WHERE m.user_id = :uid
            GROUP BY m.id
            ORDER BY m.time ASC
        ");
        $stmt->execute([':uid' => $userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['weekday'] = is_null($r['weekday']) ? null : (int)$r['weekday'];
            $r['logs']    = $r['logs'] ? explode(',', $r['logs']) : [];
        }
        echo json_encode(['status' => 'success', 'data' => $rows]);
        break;

    case 'POST':
        // Neues Medikament
        $data      = getJsonInput();
        $name      = trim($data['name']      ?? '');
        $dosage    = trim($data['dosage']    ?? '');
        $frequency = trim($data['frequency'] ?? '');
        $time      = trim($data['time']      ?? '');
        $weekday   = array_key_exists('weekday', $data) && is_numeric($data['weekday'])
            ? (int)$data['weekday']
            : null;

        if (!$name || !$dosage || !$frequency || !$time) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Alle Felder sind erforderlich']);
            exit;
        }

        $ins = $pdo->prepare("
            INSERT INTO medications
              (user_id, name, dosage, frequency, time, weekday)
            VALUES
              (:uid, :name, :dosage, :frequency, :time, :weekday)
        ");
        $ins->execute([
            ':uid'       => $userId,
            ':name'      => $name,
            ':dosage'    => $dosage,
            ':frequency' => $frequency,
            ':time'      => $time,
            ':weekday'   => $weekday
        ]);
        echo json_encode(['status' => 'success']);
        break;

    case 'PATCH':
        // Done / Undo
        $data = getJsonInput();
        if (!isset($data['action'], $data['id'], $data['date'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Bad request']);
            exit;
        }
        $medId  = (int)$data['id'];
        $date   = $data['date'];

        if ($data['action'] === 'done') {
            // Insert, ignore duplicate
            $ins = $pdo->prepare("
                INSERT IGNORE INTO medication_logs
                  (medication_id, done_date)
                VALUES
                  (:mid, :dt)
            ");
            $ins->execute([':mid' => $medId, ':dt' => $date]);
        } else {
            // Undo
            $del = $pdo->prepare("
                DELETE FROM medication_logs
                WHERE medication_id = :mid
                  AND done_date = :dt
            ");
            $del->execute([':mid' => $medId, ':dt' => $date]);
        }
        echo json_encode(['status' => 'success']);
        break;

    case 'DELETE':
        // Medikament löschen
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing id']);
            exit;
        }
        $medId = (int)$_GET['id'];
        $del   = $pdo->prepare("
            DELETE FROM medications
            WHERE id = :mid AND user_id = :uid
        ");
        $del->execute([':mid' => $medId, ':uid' => $userId]);
        echo json_encode(['status' => 'success']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
