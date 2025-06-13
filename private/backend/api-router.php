<?php
// * File: api-router.php
// * Description: Central API router: dispatches resources to correct handlers.
//                Matches URL segments with resource controllers (e.g., customers, plans).

require_once __DIR__ . '/handlers/customer-handler.php';
// Add more handler requires as needed

function routeRequest($method, $pathSegments) {
    $resource = strtolower($pathSegments[0] ?? '');

    switch ($resource) {
        case 'customers':
            handleCustomers($method, $pathSegments);
            exit;

        /* case 'plans':
            // handlePlans($method, $pathSegments);
            exit; */

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Resource Not Found']);
            exit;
    }
}

?>

