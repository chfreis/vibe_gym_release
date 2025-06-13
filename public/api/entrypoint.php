<?php
// * File: entrypoint.php
// * Description: API public entrypoint: parses request and calls the router.
//                Handles URL parsing, HTTP method, and DB connection.
require_once __DIR__ . '/../../private/backend/helpers/request-utils.php';
require_once __DIR__ . '/../../private/backend/config/constants.php';
require_once __DIR__ . '/../../private/backend/api-router.php';

header('Content-Type: application/json');

checkOrigin(ALLOWED_ORIGINS);

// Parse URL
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = $_SERVER['SCRIPT_NAME'];
$path = substr($uri, strlen($scriptName));
$pathSegments = explode('/', trim($path, '/'));

// Call router
routeRequest($_SERVER['REQUEST_METHOD'], $pathSegments);

?>
