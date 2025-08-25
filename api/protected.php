<?php
// index.php (API that returns JSON about the logged-in user)
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: max-age=31536000, immutable');

if (!isset($_SESSION['user_id'])) {
    // Instead of redirect, return a 401 JSON response
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// If they are logged in, return user data
echo json_encode([
    "status" => "success",
    "user_id" => $_SESSION['user_id'],
    "email" => $_SESSION['email']
]);
