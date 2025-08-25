<?php
// api/medikamente_page.php
ini_set('session.cookie_httponly', 1);
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: ../login.html');
    exit;
}

readfile('../medikamente.html');
