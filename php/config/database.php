<?php
// php/config/database.php

/**
 * Returns a PDO database instance based on environment configuration.
 * Supports both MySQL and SQLite via PDO.
 */
function get_db_connection(): PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $db_driver = getenv('DB_DRIVER') ?: 'sqlite';

    try {
        if ($db_driver === 'mysql') {
            $host = getenv('DB_HOST') ?: 'localhost';
            $port = getenv('DB_PORT') ?: '3306';
            $dbname = getenv('DB_NAME') ?: 'aces_pies_db';
            $user = getenv('DB_USER') ?: 'root';
            $password = getenv('DB_PASS') ?: '';

            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } else {
            // SQLite fallback
            $sqlite_path = getenv('SQLITE_PATH') ?: __DIR__ . '/../data/database.sqlite';
            $dir = dirname($sqlite_path);
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }

            $dsn = "sqlite:" . $sqlite_path;
            $pdo = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            // Enable foreign keys in SQLite
            $pdo->exec("PRAGMA foreign_keys = ON;");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database Connection Error: " . $e->getMessage()]);
        exit;
    }

    return $pdo;
}

/**
 * Generates a UUID v4 string.
 */
function generate_uuid(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
