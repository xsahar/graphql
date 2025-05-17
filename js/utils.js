// Date formatting helpers
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Format byte size to human-readable format
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1000;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Function to decode JWT and extract user ID
function getUserIdFromToken(token) {
    try {
        // Remove quotes if present in the token
        const cleanToken = token.replace(/^"(.*)"$/, '$1');
        const payloadBase64 = cleanToken.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        // Check both sub and id fields since the token might use either
        return payload.sub || payload.id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Error handling
function handleError(error, isAuthError = false) {
    console.error('Error:', error);
    
    if (isAuthError || error.message.includes('token') || error.message.includes('unauthorized')) {
        alert('Authentication error. Please login again.');
        logout();
    } else {
        alert('Error: ' + error.message);
    }
}

// Format XP value consistently with better rounding
function formatXP(xp) {
    const kbValue = xp / 1000;
    let formatted;
    
    if (kbValue >= 1000) {
        // For values >= 100 kB, round to nearest whole number
        formatted = Math.round(kbValue).toString();
    } else if (kbValue >= 10) {
        // For values >= 10 kB, round to one decimal place
        formatted = kbValue.toFixed(1);
    } else {
        // For values < 10 kB, round to two decimal places
        formatted = kbValue.toFixed(2);
    }
    
    // Remove trailing zeros after decimal point
    formatted = formatted.replace(/\.?0+$/, '');
    
    return `${formatted} kB`;
}