<?php
// * File: data-validators.php
// * Description: Functions to clean and validate user input before any database operation or business logic.
declare(strict_types=1);

function validateCpf(string $rawCpf, array &$errors): ?string {
    // Inner function for check digit calculation
    function calcCheckDigit(string $cpfPart, int $factor): int
    {
        $total = 0;
        for ($i = 0; $i < strlen($cpfPart); $i++) {
            $total += (int)$cpfPart[$i] * ($factor - $i);
        }
        $remainder = ($total * 10) % 11;
        return ($remainder === 10) ? 0 : $remainder;
    }

    // Clean input
    $cleanCpf = preg_replace('/\D/', '', trim($rawCpf));
    // Invalid repeated sequences
    $repeated = [
        '00000000000', '11111111111', '22222222222', '33333333333', '44444444444',
        '55555555555', '66666666666', '77777777777', '88888888888', '99999999999'
    ];

    // Validation checks
    if (strlen($cleanCpf) !== 11) {
        $errors[] = "Invalid CPF length";
        return null;
    }
    if (in_array($cleanCpf, $repeated)) {
        $errors[] = "CPF is a repeated sequence";
        return null;
    }
    $digit1 = calcCheckDigit(substr($cleanCpf, 0, 9), 10);
    $digit2 = calcCheckDigit(substr($cleanCpf, 0, 10), 11);
    if ($digit1 != (int)$cleanCpf[9] || $digit2 != (int)$cleanCpf[10]) {
        $errors[] = "Invalid CPF check";
        return null;
    }

    return $cleanCpf;
}


function validateDob(string $dob, array &$errors): ?string {
    $today = new DateTime();
    $dobDate = DateTime::createFromFormat('Y-m-d', trim($dob)) ?: false;

    if ($dobDate === false) {
        $errors[] = "Invalid date of birth format";
        return null;
    }
    $age = $today->diff($dobDate)->y;
    if ($age < 15 || $age > 80) {
        $errors[] = "Age must be between 16 and 79";
        return null;
    }

    return $dobDate->format('Y-m-d');
}


function validatePhone(?string $rawDddPhone, array &$errors): ?string {
    $validDdds = [
    "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "21", "22", "24", "27", "28", 
    "31", "32", "33", "34", "35", "37", "38",
    "41", "42", "43", "44", "45", "46", "47", "48", "49",
    "51", "53", "54", "55", 
    "61", "62", "63", "64", "65", "66", "67", "68", "69",
    "71", "73", "74", "75", "77", "79", "81", "82", "83", 
    "84", "85", "86", "87", "88", "89",
    "91", "92", "93", "94", "95", "96", "97", "98", "99"
];
    $cleanDddPhone = preg_replace('/\D/', '', trim($rawDddPhone));
    $ddd = substr($cleanDddPhone, 0, 2);
    $phone = substr($cleanDddPhone, 2);

    if (strlen($cleanDddPhone) !== 10 && strlen($cleanDddPhone) !== 11) {
        $errors[] = "Phone must have 10 or 11 digits";
        return null;
    }
    if (!in_array($ddd, $validDdds)) {
        $errors[] = "Invalid DDD";
        return null;
    }
    if (strlen($cleanDddPhone) === 11 && $phone[0] !== '9') {
        $errors[] = "11-digit phone numbers must start with '9'";
        return null;
    }
    if (strlen($cleanDddPhone) === 10 && $phone[0] === '9') {
        $errors[] = "10-digit landline numbers cannot start with '9'";
        return null;
    }

    return $cleanDddPhone;
}

function validateName(string $rawName, array &$errors): ?string {
    $cleanName = trim($rawName);                                // Remove leading & trailing spaces
    $cleanName = preg_replace('/[^\p{L} ]/u', '', $cleanName);  // Remove unwanted characters (anything other than letters and spaces)
    $cleanName = preg_replace('/\s+/', ' ', $cleanName);        // Collapse multiple spaces

    if (strlen($cleanName) > 100) {
        $errors[] = "Name cannot be longer than 100 characters";
        return null;
    }
    // Must have at least 2 words
    $words = array_filter(explode(' ', $cleanName), function ($word) {
        return strlen($word) > 0;
    });
    if (count($words) < 2) {
        $errors[] = "Name must have at least 2 words";
        return null;
    }
    // Each word in the name must have at least 3 characters
    foreach ($words as $word) {
        if (strlen($word) < 3) {
            $errors[] = "Each word in the name must have at least 3 characters";
            return null;
        }
    }
    // Must have at least 4 unique letters (ignoring spaces)
    $uniqueChars = count(array_unique(str_split(strtolower(str_replace(' ', '', $cleanName)))));
    if ($uniqueChars < 4) {
        $errors[] = "Name must contain at least 4 unique letters";
        return null;
    }
    // Reject if any word is repeated
    $lowerWords = array_map('strtolower', $words);
    if (count($lowerWords) !== count(array_unique($lowerWords))) {
        $errors[] = "Name cannot contain repeated words";
        return null;
    }

    return $cleanName;
}

function validateEmail(string $rawEmail, array &$errors): ?string {
    $cleanEmail = strtolower(trim($rawEmail));
    $emailRegex = '/^(?!.*\.\.)(?!.*\.$)(?!^\.)[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,63}$/';

    if (strlen($cleanEmail) > 254 || !preg_match($emailRegex, $cleanEmail)) {
        $errors[] = "Invalid email address";
        return null;
    }

    return $cleanEmail;
}

function validatePlan(string $plan, array &$errors): ?string {
    $allowedPlans = ['basico', 'premium', 'vip'];

    if (in_array($plan, $allowedPlans, true)) {
        return $plan;
    } else {
        $errors[] = "Invalid plan";
        return null;
    }
}

function validateSubPrice(string $subPrice, array &$errors): ?float {
    // Fail if there are any spaces or if not a float
    if (strpos($subPrice, ' ') !== false || filter_var($subPrice, FILTER_VALIDATE_FLOAT) === false) {
        $errors[] = "Invalid subscription price format";
        return null;
    }
    // Ensure the price matches the pattern: up to 10 digits before the decimal and 2 after
    if (!preg_match('/^\d{1,10}(\.\d{1,2})?$/', $subPrice)) {
        $errors[] = "Subscription price doesn't match the required format";
        return null;
    }

    return (float)$subPrice;
}


function validateLocal(string $location, array &$errors): ?string {
    $allowedLocations = ['camboinhas', 'icarai', 'itaipu', 'santarosa', 'saofrancisco'];

    if (in_array($location, $allowedLocations, true)) {
        return $location;
    } else {
        $errors[] = "Invalid location";
        return null;
    }
}

function validateGender(?string $gender, array &$errors): ?string {
    $allowed = ['M', 'F', 'N/A'];

    if (in_array($gender, $allowed, true)) {
        return $gender;
    } else {
        $errors[] = "Invalid gender";
        return null;
    }
}

function validateCep(string $rawCep, array &$errors): ?string {
    $cleanCep = preg_replace('/\D/', '', trim($rawCep));

    if (strlen($cleanCep) !== 8) {
        $errors[] = "Invalid CEP length";
        return null;
    }

    $url = "https://viacep.com.br/ws/{$cleanCep}/json/";
    $response = @file_get_contents($url);
    if (!$response) {
        $errors[] = "Failed to fetch CEP data";
        return null;
    }
    $data = json_decode($response, true);
    if (isset($data['erro'])) {
        $errors[] = "Invalid CEP";
        return null;
    }

    return $cleanCep;
}

function validateState(string $rawState, array &$errors): ?string {
    $cleanState = trim($rawState);

    if (strlen($cleanState) < 7 || strlen($cleanState) > 25) {
        $errors[] = "State name must be between 7 and 25 characters.";
        return null;
    }
    if (preg_match('/[^\p{L} ]/u', $cleanState)) {
        $errors[] = "State name must only contain letters and spaces.";
        return null;
    }
    if (preg_match('/\s{2,}/', $cleanState)) {
        $errors[] = "State name must not contain multiple consecutive spaces.";
        return null;
    }

    return $cleanState;
}

function validateCity(string $rawCity, array &$errors): ?string {
    $cleanCity = trim($rawCity);

    if (strlen($cleanCity) < 3 || strlen($cleanCity) > 50) {
        $errors[] = "City name must be between 3 and 50 characters.";
        return null;
    }
    if (preg_match('/[^\p{L} ]/u', $cleanCity)) {
        $errors[] = "City name must only contain letters and spaces.";
        return null;
    }
    if (preg_match('/\s{2,}/', $cleanCity)) {
        $errors[] = "City name must not contain multiple consecutive spaces.";
        return null;
    }

    return $cleanCity;
}

function validateAddrL1(string $rawAddrL1, array &$errors): ?string {
    $cleanAddrL1 = trim($rawAddrL1);

    if (strlen($cleanAddrL1) < 5 || strlen($cleanAddrL1) > 100) {
        $errors[] = "AddressLine1 must be between 5 and 100 characters.";
        return null;
    }
    if (preg_match('/[^\p{L} ]/u', $cleanAddrL1)) {
        $errors[] = "AddressLine1 must only contain letters and spaces.";
        return null;
    }
    if (preg_match('/\s{2,}/', $cleanAddrL1)) {
        $errors[] = "AddressLine1 must not contain multiple consecutive spaces.";
        return null;
    }

    return $cleanAddrL1;
}

function validateAddrNum(?string $rawAddrNum, array &$errors): ?string {
    // Remove any non-digit characters
    $cleanAddrNum = preg_replace('/\D/', '', $rawAddrNum);

    // Check if valid number between 1 and 9999
    if ($cleanAddrNum !== "" && (int)$cleanAddrNum > 0 && (int)$cleanAddrNum <= 9999) {
        return strval((int)$cleanAddrNum);
    } else {
        $errors[] = "Invalid address number.";
        return null;
    }
}

function validateAddrL2(?string $rawAddrL2, array &$errors): ?string {
    $cleanAddrL2 = preg_replace('/\s+/', ' ', trim($rawAddrL2));
    $uniqueChars = count(array_unique(str_split(str_replace(' ', '', $cleanAddrL2))));
    $hasValidWord = preg_match('/\b[\p{L}\p{N}]{3,}\b/u', $cleanAddrL2);

    if (strlen($cleanAddrL2) >= 3 && strlen($cleanAddrL2) <= 100 && $uniqueChars >= 3 && $hasValidWord) {
        return $cleanAddrL2;
    } else {
        $errors[] = "Invalid address line 2.";
        return null;
    }
}

function validateOptField($value, callable $validFunc, array &$errors): ?string {
    // If user left an empty optional field set to null b4 db operations
    if ($value === "") return null;

    return $validFunc($value, $errors);
}

?>
