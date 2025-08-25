<?php
// /api/register.php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $vorname  = trim($_POST['vorname'] ?? '');
    $nachname = trim($_POST['nachname'] ?? '');

    if (!$email || !$password || !$vorname || !$nachname) {
        echo json_encode(["status" => "error", "message" => "Alle Felder sind erforderlich"]);
        exit;
    }

    // E-Mail-Verfügbarkeit prüfen
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "E-Mail bereits vergeben"]);
        exit;
    }

    // Passwort hashen und User anlegen
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $ins  = $pdo->prepare("INSERT INTO users (email, password) VALUES (:email, :pass)");
    $ins->execute([':email'=>$email, ':pass'=>$hash]);
    $userId = $pdo->lastInsertId();

    // Profil anlegen
    $prof = $pdo->prepare("INSERT INTO user_profiles (user_id, firstname, lastname) VALUES (:uid,:fn,:ln)");
    $prof->execute([':uid'=>$userId, ':fn'=>$vorname, ':ln'=>$nachname]);

    // Session neu erzeugen und einloggen
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['email']   = $email;

    echo json_encode(["status" => "success"]);
    exit;
} else {
    echo json_encode(["status" => "error", "message" => "Ungültige Methode"]);
}
