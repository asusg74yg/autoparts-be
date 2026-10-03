<?php
// php/helpers/response.php

/**
 * Send JSON response and exit.
 */
function send_json_response($data, int $status_code = 200): void {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send error JSON response.
 */
function send_error_response(string $message, int $status_code = 400): void {
    send_json_response(['error' => $message, 'statusCode' => $status_code], $status_code);
}

/**
 * Get request body as JSON associative array or array fallback.
 */
function get_json_input(): array {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return $_POST;
    }
    $decoded = json_decode($input, true);
    return is_array($decoded) ? array_merge($_POST, $decoded) : $_POST;
}
