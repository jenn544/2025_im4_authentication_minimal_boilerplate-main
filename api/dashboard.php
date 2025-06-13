<?php
// dashboard.php
ini_set('session.cookie_httponly', 1);
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}

// liefert das eigentliche Dashboard-HTML aus
readfile('dashboard.html');
