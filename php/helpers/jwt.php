<?php
// php/helpers/jwt.php

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'super_secret_jwt_key_1234567890');

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Generate JWT token.
 */
function jwt_encode(array $payload, int $expiry_seconds = 86400): string {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + $expiry_seconds;
    $payload_encoded = json_encode($payload);

    $base64_header = base64url_encode($header);
    $base64_payload = base64url_encode($payload_encoded);

    $signature = hash_hmac('sha256', $base64_header . "." . $base64_payload, JWT_SECRET, true);
    $base64_signature = base64url_encode($signature);

    return $base64_header . "." . $base64_payload . "." . $base64_signature;
}

/**
 * Verify and decode JWT token. Returns payload or false.
 */
function jwt_decode(string $jwt) {
    $token_parts = explode('.', $jwt);
    if (count($token_parts) !== 3) {
        return false;
    }

    $header = base64url_decode($token_parts[0]);
    $payload = base64url_decode($token_parts[1]);
    $provided_signature = $token_parts[2];

    $expiration = json_decode($payload)->exp ?? 0;
    if ($expiration - time() < 0) {
        return false; // Expired
    }

    $base64_header = base64url_encode($header);
    $base64_payload = base64url_encode($payload);
    $signature = hash_hmac('sha256', $base64_header . "." . $base64_payload, JWT_SECRET, true);
    $base64_signature = base64url_encode($signature);

    if (hash_equals($base64_signature, $provided_signature)) {
        return json_decode($payload, true);
    }

    return false;
}
