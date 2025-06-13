<?php
// * File: request-utils.php
// * Description: Request utilities: handles CORS origin check and JSON input parsing.
//                Used by handlers to validate requests and safely parse payloads.

function checkOrigin(array $allowedOrigins) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!in_array($origin, $allowedOrigins)) {
        http_response_code(403);  // Forbidden
        echo json_encode(['error' => 'Forbidden origin']);
        exit;
    }
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log('Invalid JSON input from ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown IP') . '. Raw input: ' . $input);
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input.']);
        exit;
    }
    if (!$data) {
        error_log('Empty JSON payload received from ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown IP'));
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No data received.']);
        exit;
    }
    return $data;
}

?>