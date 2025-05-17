// Store JWT token in localStorage
function storeAuthToken(token) {
    // Use the session manager to store the token with expiration
    return window.SessionManager.storeSession(token);
}

// Retrieve JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem('jwt');
}

// Check if user is authenticated
function isAuthenticated() {
    const token = getAuthToken();
    if (!token) return false;
    
    // Check if session is valid using session manager
    return window.SessionManager.checkSession();
}

// Parse JWT to get user info
function parseJWT(token) {
    return window.SessionManager.parseJWT(token);
}

// Get user info from stored JWT
function getUserInfo() {
    const token = getAuthToken();
    return token ? parseJWT(token) : null;
}

// Log out user and reset UI
function logout() {
    window.SessionManager.endSession();
    updateUIAuthState();
}

// Initialize auth state on page load
function initAuth() {
    if (isAuthenticated()) {
        // If we have a function to update UI based on auth state, call it
        if (typeof updateUIAuthState === 'function') {
            updateUIAuthState();
        }
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);