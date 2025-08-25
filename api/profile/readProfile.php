<?php
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: max-age=31536000, immutable');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

