// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the login page or profile page
    const isLoginPage = document.getElementById('loginForm') !== null;
    const isProfilePage = document.getElementById('profile-section') !== null;
    
    // Initialize auth system
    initAuth();
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            window.location.href = 'index.html'; // Redirect to main page after logout
        });
    }
    
    // Handle page-specific initialization
    if (isProfilePage && isAuthenticated()) {
        // Show profile section
        updateUIAuthState();
        
        // If we're on the profile page and authenticated, fetch user data
        fetchUserData().catch(error => {
            console.error('Error loading profile data:', error);
            if (error.message.includes('token') || error.message.includes('unauthorized')) {
                alert('Session expired. Please login again.');
                logout();
                updateUIAuthState();
            }
        });
    } else if (isProfilePage && !isAuthenticated()) {
        // Redirect to login if not authenticated
        updateUIAuthState();
    } else if (isLoginPage && isAuthenticated()) {
        // Redirect to profile if already authenticated
        updateUIAuthState();
    }
});

// Update UI based on authentication state
function updateUIAuthState() {
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    
    if (loginSection && profileSection) {
        if (isAuthenticated()) {
            loginSection.style.display = 'none';
            profileSection.style.display = 'flex';
        } else {
            loginSection.style.display = 'flex';
            profileSection.style.display = 'none';
        }
    }
}