<?php
// php/public/index.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static assets or route API
if (strpos($uri, '/api/') === 0) {
    require_once __DIR__ . '/../api/router.php';
    exit;
}

// Serve uploaded files directly if exists
if (strpos($uri, '/uploads/') === 0) {
    $filePath = __DIR__ . $uri;
    if (file_exists($filePath) && !is_dir($filePath)) {
        $mime = mime_content_type($filePath);
        header("Content-Type: {$mime}");
        readfile($filePath);
        exit;
    }
}

// Default fallback: serve main index.html
readfile(__DIR__ . '/index.html');
