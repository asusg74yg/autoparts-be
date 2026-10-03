<?php
// php/helpers/auth.php

require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/response.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Get current authenticated user details from JWT Bearer token or PHP Session.
 */
function get_authenticated_user(): ?array {
    // 1. Check Authorization Bearer header
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        $jwt = $matches[1];
        $payload = jwt_decode($jwt);
        if ($payload) {
            return $payload;
        }
    }

    // 2. Check Session
    if (!empty($_SESSION['user'])) {
        return $_SESSION['user'];
    }

    return null;
}

/**
 * Require user authentication. Exits with 401 if unauthenticated.
 */
function require_auth(): array {
    $user = get_authenticated_user();
    if (!$user) {
        send_error_response('Unauthorized: Access token missing or invalid', 401);
    }
    return $user;
}

/**
 * Require specific role(s). Exits with 403 if unauthorized.
 */
function require_roles(array $allowed_roles): array {
    $user = require_auth();
    $user_role = strtoupper($user['role'] ?? '');
    $allowed_upper = array_map('strtoupper', $allowed_roles);

    if (!in_array($user_role, $allowed_upper, true)) {
        send_error_response('Forbidden: You do not have permission to access this resource', 403);
    }
    return $user;
}
