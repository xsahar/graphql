// Authentication endpoint URL from README
const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';

// Create a Basic authentication header from username and password
function createBasicAuthHeader(username, password) {
    // Base64 encode the credentials in format "username:password"
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    return `Basic ${encodedCredentials}`;
}

// Send authentication request to get JWT
async function authenticate(username, password) {
    try {
        // Create the Authentication header
        const authHeader = createBasicAuthHeader(username, password);
        
        // Make the request to the authentication endpoint
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            }
        });
        
        // Check if request was successful
        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.statusText}`);
        }
        
        // Get the JWT token from response
        const token = await response.text();
        return token;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

// Handle login form submission
async function handleLogin(event) {
    // Prevent default form submission
    event.preventDefault();
    
    // Get form inputs
    const username = document.getElementById('usernameOrEmail').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('errorMessage');
    
    // Clear previous error messages
    errorElement.textContent = '';
    
    // Basic validation
    if (!username || !password) {
        errorElement.textContent = 'Please enter both username and password';
        return;
    }
    
    // Update button to show loading state
    const loginButton = document.querySelector('.login-btn');
    const originalButtonContent = loginButton.innerHTML;
    loginButton.disabled = true;
    loginButton.innerHTML = '<span>Logging in...</span> <i class="fas fa-spinner fa-spin"></i>';
    
    try {
        // Attempt authentication
        const token = await authenticate(username, password);
        
        // Store the token
        if (token) {
            storeAuthToken(token);
            
            // Update UI to show success
            errorElement.textContent = 'Login successful!';
            errorElement.style.color = 'var(--success)';
            setTimeout(() => {
                updateUIAuthState();
                // Try to fetch user data right away
                fetchUserData().catch(err => console.error('Error loading data:', err));
            }, 500);
        }
    } catch (error) {
        // Show error message
        errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
        errorElement.style.color = 'var(--danger)';
        
        // Reset button
        loginButton.disabled = false;
        loginButton.innerHTML = originalButtonContent;
    }
}

// Set up event listener for form submission when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});