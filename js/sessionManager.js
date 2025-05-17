
// Default session duration (in milliseconds)
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Store JWT token in localStorage with expiration
function storeSession(token) {
    if (!token) return false;
    
    // Store the token
    localStorage.setItem('jwt', token);
    
    try {
        // Check if token has built-in expiration
        const payload = parseJWT(token);
        
        // If token has its own expiration, use that
        if (payload && payload.exp) {
            const expTime = payload.exp * 1000; // Convert seconds to milliseconds
            localStorage.setItem('jwtExpiration', expTime);
        } else {
            // Otherwise set default expiration time
            const expTime = new Date().getTime() + DEFAULT_SESSION_DURATION;
            localStorage.setItem('jwtExpiration', expTime);
        }
        
        return true;
    } catch (error) {
        console.error('Error storing session:', error);
        // Set default expiration as fallback
        const expTime = new Date().getTime() + DEFAULT_SESSION_DURATION;
        localStorage.setItem('jwtExpiration', expTime);
        return true;
    }
}

// Check if the token has expired
function isSessionExpired() {
    try {
        // Check if client-side expiration has passed
        const expiration = localStorage.getItem('jwtExpiration');
        if (expiration) {
            const expTime = parseInt(expiration);
            if (new Date().getTime() > expTime) {
                console.log('Session expired based on local expiration time');
                return true;
            }
        }
        
        // As a double-check, also verify JWT expiration if present
        const token = localStorage.getItem('jwt');
        if (!token) return true;
        
        const payload = parseJWT(token);
        if (payload && payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
            if (payload.exp < currentTime) {
                console.log('Session expired based on JWT exp field');
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking session expiration:', error);
        return true; // If we can't verify, safer to assume expired
    }
}

// Parse JWT without altering it
function parseJWT(token) {
    if (!token) return null;
    
    try {
        // Remove quotes if present in the token
        const cleanToken = token.replace(/^"(.*)"$/, '$1');
        const payloadBase64 = cleanToken.split('.')[1];
        const payloadJson = atob(payloadBase64);
        return JSON.parse(payloadJson);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// End the current session
function endSession() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('jwtExpiration');
    // Could add other session-related cleanup here
}

// Check session status and handle expiration
function checkSession() {
    if (isSessionExpired()) {
        endSession();
        return false;
    }
    return true;
}

// Export functions for use in other modules
window.SessionManager = {
    storeSession,
    isSessionExpired,
    checkSession,
    endSession,
    parseJWT
};