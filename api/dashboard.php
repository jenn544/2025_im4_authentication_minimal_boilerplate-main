<?php
// dashboard.php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: text/html');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: max-age=31536000, immutable');

if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}

// liefert das eigentliche Dashboard-HTML aus
readfile('dashboard.html');
