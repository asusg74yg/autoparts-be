<?php
// php/helpers/upload.php

require_once __DIR__ . '/response.php';

/**
 * Handles single or multiple file uploads and returns their web relative URLs.
 */
function handle_file_uploads(string $file_field_name = 'files', string $upload_dir = __DIR__ . '/../public/uploads/'): array {
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $uploaded_urls = [];

    if (!isset($_FILES[$file_field_name])) {
        return $uploaded_urls;
    }

    $files = $_FILES[$file_field_name];

    if (is_array($files['name'])) {
        $count = count($files['name']);
        for ($i = 0; $i < $count; $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $tmp_name = $files['tmp_name'][$i];
                $name = basename($files['name'][$i]);
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                $unique_name = uniqid('file_', true) . ($ext ? '.' . $ext : '');
                $target_path = $upload_dir . $unique_name;

                if (move_uploaded_file($tmp_name, $target_path)) {
                    $uploaded_urls[] = '/uploads/' . $unique_name;
                }
            }
        }
    } else {
        if ($files['error'] === UPLOAD_ERR_OK) {
            $tmp_name = $files['tmp_name'];
            $name = basename($files['name']);
            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $unique_name = uniqid('file_', true) . ($ext ? '.' . $ext : '');
            $target_path = $upload_dir . $unique_name;

            if (move_uploaded_file($tmp_name, $target_path)) {
                $uploaded_urls[] = '/uploads/' . $unique_name;
            }
        }
    }

    return $uploaded_urls;
}
