<?php
// * File: customer-handler.php
// * Description: Customer handler: processes CRUD operations for customers.
//                Called by the router based on HTTP methods.

require_once __DIR__ . '/../helpers/data-validators.php';
require_once __DIR__ . '/../config/db-session.php';

function handleCustomers($method, $pathSegments)
{
    switch ($method) {
        case 'POST':
            // POST /customers/search - if cpf or email present
            if (isset($pathSegments[1]) && $pathSegments[1] === 'search') {
                $input = getJsonInput();
                // Check if it's just an existence check
                if (isset($input['exists_check']) && $input['exists_check'] === true) {
                    $result = checkCustomer($input['identifier']);
                } else {
                    $result = getCustomerInfo($input['identifier']);
                }
                echo json_encode($result);
                exit;
            } else {
                $result = createCustomer();
                echo json_encode($result);
                exit;
            }

        case 'PATCH':
            // PATCH /customers/{id} - Update specific customer with changed fields
            if (isset($pathSegments[1]) && is_numeric($pathSegments[1])) {
                $customerId = intval($pathSegments[1]);
                $changedFields = getJsonInput();
                $result = updateCustomer($customerId, $changedFields);
                echo json_encode($result);
                exit;
            }
            // If no valid ID provided
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or missing customer ID']);
            exit;

        case 'DELETE':
            // DELETE /customers/{id} - Delete specific customer
            if (isset($pathSegments[1]) && is_numeric($pathSegments[1])) {
                $customerId = intval($pathSegments[1]);
                $result = deleteCustomer($customerId);
                echo json_encode($result);
                exit;
            }
            // If no valid ID provided
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or missing customer ID']);
            exit;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
    }
}

function createCustomer()
{
    $data = getJsonInput();
    $errors = [];

    // Validate fields
    $cpf = validateCpf($data['cpf'], $errors);
    $dob = validateDob($data['dob'], $errors);
    $phone = validateOptField($data['phone'], 'validatePhone', $errors);
    $name = validateName($data['full_name'], $errors);
    $email = validateEmail($data['email'], $errors);
    $plan = validatePlan($data['plan'], $errors);
    $subPrice = validateSubPrice($data['sub_price'], $errors);
    $location = validateLocal($data['location'], $errors);
    $gender = validateOptField($data['gender'], 'validateGender', $errors);
    $cep = validateCep($data['cep'], $errors);
    $state = validateState($data['state'], $errors);
    $city = validateCity($data['city'], $errors);
    $addressLine1 = validateAddrL1($data['address_line1'], $errors);
    $addressNum = validateOptField($data['address_num'], 'validateAddrNum', $errors);
    $addressLine2 = validateOptField($data['address_line2'], 'validateAddrL2', $errors);

    // Required check
    $requiredFields = [
        'cpf' => $cpf, 'dob' => $dob, 'name' => $name, 'email' => $email,
        'plan' => $plan, 'subPrice' => $subPrice, 'location' => $location,
        'cep' => $cep, 'state' => $state, 'city' => $city,
        'addressLine1' => $addressLine1,
    ];
    foreach ($requiredFields as $key => $value) {
        if ($value === null || count($errors) > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }
    }
    // DB connection AFTER data validation
    $conn = DBSession::getConn();
    // SQL
    $stmt = $conn->prepare(
        "INSERT INTO customers 
        (cpf, dob, phone, full_name, email, plan, sub_price, location, gender, 
            cep, state, city, address_line1, address_num, address_line2, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())"
    );
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'SQL error: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param(
        "ssssssdssssssss",  // Param types for each variable
        $cpf, $dob, $phone, $name, $email,
        $plan, $subPrice, $location, $gender, $cep,
        $state, $city, $addressLine1, $addressNum, $addressLine2
    );
    if ($stmt->execute()) {
        $stmt->close();
        http_response_code(201);
        return ['success' => true, 'message' => 'Customer registered successfully'];
    } else {
        $stmt->close();
        http_response_code(500);
        return ['success' => false, 'message' => 'Execute failed: ' . $stmt->error];
    }
}

function checkCustomer($identifier)
{
    try {
        if (empty($identifier)) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Identifier required'];
        }

        $conn = DBSession::getConn();

        if (is_numeric($identifier)) {
            $stmt = $conn->prepare("SELECT id FROM customers WHERE cpf = ? LIMIT 1");
        } else {
            $stmt = $conn->prepare("SELECT id FROM customers WHERE email = ? LIMIT 1");
        }

        if (!$stmt) {
            http_response_code(500);
            return ['success' => false, 'message' => 'SQL error: ' . $conn->error];
        }

        $stmt->bind_param("s", $identifier);
        if (!$stmt->execute()) {
            $stmt->close();
            http_response_code(500);
            return ['success' => false, 'message' => 'Execute failed: ' . $stmt->error];
        }

        $result = $stmt->get_result();
        $customer = $result->fetch_assoc();
        $stmt->close();

        if ($customer) {
            http_response_code(200);
            return [
                'success' => true,
                'exists' => true,
                'id' => $customer['id']
            ];
        } else {
            http_response_code(404);
            return [
                'success' => false,
                'exists' => false,
                'message' => 'Customer not found'
            ];
        }
    } catch (Exception $e) {
        error_log('Error in checkCustomer: ' . $e->getMessage());
        http_response_code(500);
        return ['success' => false, 'message' => 'Internal server error'];
    }
}

function getCustomerInfo($identifier)
{
    try {
        if (empty($identifier)) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Identifier required'];
        }
        // Get database connection using your existing method
        $conn = DBSession::getConn();

        $stmt = $conn->prepare(
            "SELECT id, cpf, dob, phone, full_name, email,
                plan, sub_price, location, gender, cep, state,
                city, address_line1, address_num, address_line2
            FROM customers WHERE id = ?"
        );

        if (!$stmt) {
            http_response_code(500);
            return ['success' => false, 'message' => 'SQL error: ' . $conn->error];
        }
        $stmt->bind_param("s", $identifier);
        if (!$stmt->execute()) {
            $stmt->close();
            http_response_code(500);
            return ['success' => false, 'message' => 'Execute failed: ' . $stmt->error];
        }

        $result = $stmt->get_result();
        $customer = $result->fetch_assoc();
        $stmt->close();

        if ($customer) {
            http_response_code(200);
            return [
                'success' => true,
                'message' => 'Customer found',
                'customer' => $customer
            ];
        } else {
            http_response_code(404);
            return [
                'success' => false,
                'message' => 'Customer not found'
            ];
        }
    } catch (Exception $e) {
        error_log('Error in getCustomerInfo: ' . $e->getMessage());
        http_response_code(500);
        return [
            'success' => false,
            'message' => 'Internal server error'
        ];
    }
}

function updateCustomer($customerId, $changedFields)
{
    $errors = [];

    // Validate customer ID
    if ($customerId === null || !is_numeric($customerId)) {
        http_response_code(400);
        return ['success' => false, 'errors' => ['Invalid customer ID']];
    }

    // Only validate fields that are being updated
    $validatedFields = [];
    $updateColumns = [];
    $updateParams = [];
    $paramTypes = "";

    // Validation functions mapping
    $fieldValidations = [
        'cpf' => 'validateCpf', 'dob' => 'validateDob', 'phone' => 'validateOptField',
        'full_name' => 'validateName', 'email' => 'validateEmail', 'plan' => 'validatePlan',
        'sub_price' => 'validateSubPrice', 'location' => 'validateLocal', 'gender' => 'validateOptField',
        'cep' => 'validateCep', 'state' => 'validateState', 'city' => 'validateCity',
        'address_line1' => 'validateAddrL1', 'address_num' => 'validateOptField',
        'address_line2' => 'validateOptField'
    ];
    $requiredFields = [
        'cpf', 'dob', 'full_name', 'email',
        'plan', 'sub_price', 'location', 'cep',
        'state', 'city', 'address_line1'
    ];

    // Validate only the fields that are being updated
    foreach ($changedFields as $field => $value) {
        if (isset($fieldValidations[$field])) {
            $validator = $fieldValidations[$field];
            switch ($field) {
                case 'phone':
                    $validatedValue = $validator($value, 'validatePhone', $errors);
                    break;
                case 'gender':
                    $validatedValue = $validator($value, 'validateGender', $errors);
                    break;
                case 'address_num':
                    $validatedValue = $validator($value, 'validateAddrNum', $errors);
                    break;
                case 'address_line2':
                    $validatedValue = $validator($value, 'validateAddrL2', $errors);
                    break;
                default:
                    $validatedValue = $validator($value, $errors);
                    break;
            }

            // For required fields, check if they're not null/empty
            if (in_array($field, $requiredFields) && ($validatedValue === null || $validatedValue === '')) {
                $errors[] = "Field $field cannot be empty";
                continue;
            }

            if (count($errors) === 0) {
                $validatedFields[$field] = $validatedValue;
                $updateColumns[] = "$field = ?";
                $updateParams[] = $validatedValue;
                $paramTypes .= ($field === 'sub_price') ? 'd' : 's';
            }
        } else {
            $errors[] = "Invalid field: $field";
        }
    }

    // Return errors if any validation failed
    if (count($errors) > 0) {
        http_response_code(400);
        return ['success' => false, 'errors' => $errors];
    }
    // If no fields to update
    if (empty($updateColumns)) {
        http_response_code(400);
        return ['success' => false, 'errors' => ['No valid fields to update']];
    }

    // DB connection AFTER validation
    $conn = DBSession::getConn();
    // Build and execute UPDATE query
    $sql = "UPDATE customers SET " . implode(', ', $updateColumns) . ", updated_at = NOW() WHERE id = ?";
    $updateParams[] = $customerId; // Add customer ID 
    $paramTypes .= 'i'; // Add integer type for customer ID 

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($paramTypes, ...$updateParams);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $stmt->close();
            http_response_code(200);
            return ['success' => true, 'message' => 'Customer updated successfully'];
        } else {
            $stmt->close();
            http_response_code(404);
            return ['success' => false, 'message' => 'Customer not found'];
        }
    } else {
        $stmt->close();
        http_response_code(500);
        return ['success' => false, 'message' => 'Execute failed: ' . $stmt->error];
    }
}

function deleteCustomer($customerId)
{
    // Validate customer ID
    if ($customerId === null || !is_numeric($customerId)) {
        http_response_code(400);
        return ['success' => false, 'errors' => ['Invalid customer ID']];
    }

    // DB connection
    $conn = DBSession::getConn();

    // Execute DELETE query with LIMIT 1 for safety
    $deleteSql = "DELETE FROM customers WHERE id = ? LIMIT 1";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param('i', $customerId);

    if ($deleteStmt->execute()) {
        $rowsAffected = $deleteStmt->affected_rows;
        $deleteStmt->close();

        if ($rowsAffected > 0) {
            http_response_code(200);
            return [
                'success' => true,
                'message' => 'Customer deleted successfully',
                'rows_affected' => $rowsAffected
            ];
        } else {
            // Customer not found
            http_response_code(404);
            return ['success' => false, 'message' => 'Customer not found'];
        }
    } else {
        $deleteStmt->close();
        http_response_code(500);
        return ['success' => false, 'message' => 'Delete failed: ' . $conn->error];
    }
}
