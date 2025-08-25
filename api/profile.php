<?php
// api/profile.php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: max-age=31536000, immutable');
require_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status'=>'error','message'=>'Unauthorized']);
    exit;
}
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Profildaten auslesen
    $stmt = $pdo->prepare("SELECT name, email, birthdate FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['status'=>'success','data'=>$user]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data      = json_decode(file_get_contents('php://input'), true);
    $name      = trim($data['name']      ?? '');
    $email     = trim($data['email']     ?? '');
    $password  = $data['password'] ?? '';
    $birthdate = trim($data['birthdate'] ?? '');

    if (!$name || !$email) {
        echo json_encode(['status'=>'error','message'=>'Name und E-Mail sind Pflichtfelder']);
        exit;
    }

    // Wenn Passwort-Feld nicht leer, immer updaten (mit Mindestlänge 6)
    if ($password !== '') {
        if (strlen($password) < 6) {
            echo json_encode(['status'=>'error','message'=>'Das Passwort muss mindestens 6 Zeichen lang sein']);
            exit;
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            UPDATE users
               SET name = ?, email = ?, password = ?, birthdate = ?
             WHERE id = ?
        ");
        $stmt->execute([$name, $email, $hash, $birthdate, $userId]);
    } else {
        // Ohne Passwort-Änderung
        $stmt = $pdo->prepare("
            UPDATE users
               SET name = ?, email = ?, birthdate = ?
             WHERE id = ?
        ");
        $stmt->execute([$name, $email, $birthdate, $userId]);
    }

    echo json_encode(['status'=>'success']);
    exit;
}

http_response_code(405);
echo json_encode(['status'=>'error','message'=>'Method not allowed']);
