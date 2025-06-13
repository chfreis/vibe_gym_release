// Handles all API interactions related to customer data.
// Functions include user registration, profile retrieval, updates and deletions.

async function createCustomer(personInfo) {
    try {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('public'); // Look for 'public'
        const projectName = pathSegments[projectIndex - 1];  // 'vibe_gym' right now
        const baseUrl = `${window.location.origin}/${projectName}/public`;

        //console.log(JSON.stringify(personInfo));
        const response = await fetch(`${baseUrl}/api/entrypoint.php/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personInfo)
        });
        const text = await response.text();
        // console.log('📦 Raw response text:', text);
        const data = JSON.parse(text);
        // console.log('🚀 Parsed JSON:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Check if customer exists
async function checkCustomer(identifier) {
    try {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('public');
        const projectName = pathSegments[projectIndex - 1];
        const baseUrl = `${window.location.origin}/${projectName}/public`;
       
        const response = await fetch(`${baseUrl}/api/entrypoint.php/customers/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                identifier: identifier,
                exists_check: true 
            })
        });
        const text = await response.text();
        //console.log('📦 Raw response text:', text);
        const data = JSON.parse(text);
        //console.log('🚀 Parsed JSON:', data);
        return data;
    } catch (error) {
        console.error('Error checking customer:', error);
        throw error;
    }
}

// Get full customer data
async function getCustomerInfo(identifier) {
    try {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('public');
        const projectName = pathSegments[projectIndex - 1];
        const baseUrl = `${window.location.origin}/${projectName}/public`;
        
        const response = await fetch(`${baseUrl}/api/entrypoint.php/customers/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier })
        });
        
        const text = await response.text();
        //console.log('📦 Raw response text:', text);
        const data = JSON.parse(text);
        //console.log('🚀 Parsed JSON:', data);
        return data;
    } catch (error) {
        console.error('Error reading customer:', error);
        throw error;
    }
}

async function updateCustomer(customerId, changedFields) {
    try {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('public'); // Look for 'public'
        const projectName = pathSegments[projectIndex - 1];  // 'vibe_gym' right now
        const baseUrl = `${window.location.origin}/${projectName}/public`;
        
        const response = await fetch(`${baseUrl}/api/entrypoint.php/customers/${customerId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedFields)
        });
        
        const text = await response.text();
        //console.log('📦 Raw response text:', text);
        const data = JSON.parse(text);
        //console.log('🚀 Parsed JSON:', data);
        return data;
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
}

async function deleteCustomer(customerId) {
    try {
        const pathSegments = window.location.pathname.split('/');
        const projectIndex = pathSegments.indexOf('public'); // Look for 'public'
        const projectName = pathSegments[projectIndex - 1];  // 'vibe_gym' right now
        const baseUrl = `${window.location.origin}/${projectName}/public`;
       
        const response = await fetch(`${baseUrl}/api/entrypoint.php/customers/${customerId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
       
        const text = await response.text();
        //console.log('📦 Raw response text:', text);
        const data = JSON.parse(text);
        //console.log('🚀 Parsed JSON:', data);
        return data;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
}
