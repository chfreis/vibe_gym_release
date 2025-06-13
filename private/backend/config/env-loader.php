<?php
// env-loader.php — Minimal .env parser

function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception("❌ .env file not found at {$path}");
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Split by first "=" only
        $parts = explode('=', $line, 2);

        if (count($parts) === 2) {
            $key   = trim($parts[0]);
            $value = trim($parts[1]);

            // Remove optional quotes
            $value = trim($value, "\"'");

            // Set to superglobals
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
            putenv("$key=$value");
        }
    }
}
?>
