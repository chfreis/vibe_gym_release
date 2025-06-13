<?php
// * File: db-session.php
// * Description: Manages DB connection lifecycle (singleton per request).

require_once __DIR__ . '/env-loader.php';
loadEnv(__DIR__ . '/../.env');

class DBSession {
    private static $conn = null;

    public static function getConn() {
        if (self::$conn === null) {
            self::$conn = self::dbConnect();
        }
        return self::$conn;
    }

    private static function dbConnect() {
        $host = $_ENV['DB_HOST'];
        $user = $_ENV['DB_USER'];
        $pass = $_ENV['DB_PASS'];
        $db   = $_ENV['DB_NAME'];

        $conn = new mysqli($host, $user, $pass, $db);

        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed',
                'details' => $conn->connect_error
            ]);
            exit;
        }

        return $conn;
    }

    public static function closeConn() {
        if (self::$conn !== null) {
            self::$conn->close();
            self::$conn = null;
        }
    }
}
// Auto-close on script shutdown:
register_shutdown_function(function() {
    DBSession::closeConn();
});

?>
