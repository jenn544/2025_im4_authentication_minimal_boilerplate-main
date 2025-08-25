<?php
// logout.php
session_start();
$_SESSION = [];
session_destroy();

// Return a success response instead of redirecting
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: max-age=31536000, immutable');
echo json_encode(["status" => "success"]);
exit;

?>
