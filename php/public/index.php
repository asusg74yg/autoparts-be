<?php
// php/public/index.php

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If URL contains /api/, route to router
if (strpos($request_uri, '/api/') !== false) {
    // Extract normalized URI starting from /api/
    $api_pos = strpos($request_uri, '/api/');
    $_SERVER['NORMALIZED_API_URI'] = substr($request_uri, $api_pos);
    require_once __DIR__ . '/../api/router.php';
    exit;
}

// Serve uploaded files directly if exists
if (strpos($request_uri, '/uploads/') !== false) {
    $upload_pos = strpos($request_uri, '/uploads/');
    $relPath = substr($request_uri, $upload_pos);
    $filePath = __DIR__ . $relPath;
    if (file_exists($filePath) && !is_dir($filePath)) {
        $mime = mime_content_type($filePath);
        header("Content-Type: {$mime}");
        readfile($filePath);
        exit;
    }
}

// Default fallback: serve main index.html
readfile(__DIR__ . '/index.html');
