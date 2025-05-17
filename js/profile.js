document.addEventListener('DOMContentLoaded', async () => {
    if (isAuthenticated()) {
        try {
            await fetchUserData();
        } catch (error) {
            console.error('Error:', error);
            // Only logout if it's an authentication error
            if (error.message.includes('token') || error.message.includes('unauthorized')) {
                alert('Authentication error. Please login again.');
                logout();
            } else {
                alert('Error loading profile data: ' + error.message);
            }
        }
    } else {
        toggleAuthUI(false);
    }
});

// Add this function if it doesn't exist elsewhere
function toggleAuthUI(isLoggedIn) {
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    
    if (loginSection && profileSection) {
        if (isLoggedIn) {
            loginSection.style.display = 'none';
            profileSection.style.display = 'block';
        } else {
            loginSection.style.display = 'block';
            profileSection.style.display = 'none';
        }
    }
}

// Move the data fetching logic to a separate function that can be called from various places
async function fetchUserData() {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    const userId = getUserIdFromToken(token);
    if (!userId) {
        throw new Error('Could not get user ID from token');
    }

    const userData = await fetchGraphQLUserData(userId, token);
    
    // Calculate total XP by filtering XP transactions more selectively
    const totalXP = calculateTotalXP(userData.transactions);
    
    // Round the total XP to whole number before formatting
    const roundedTotalXP = Math.round(totalXP / 1000) * 1000;
    
    // Format XP using the utility function
    const formattedTotalXP = formatXP(roundedTotalXP);
    
    // Calculate top projects XP for charts, but don't show in user info
    const topProjectsXP = getTopProjectsXP(userData.transactions);

    // Update UI with user information
    document.getElementById('username').textContent = 
        `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.login;

    // Update user info with a cleaner layout without redundant information
    // Removed the Top Projects XP section
    document.getElementById('xp').innerHTML = `
        <div class="user-info-grid">
            <div class="user-info-item">
                <div class="info-label"><i class="fas fa-user"></i> Username</div>
                <div class="info-value">${userData.login}</div>
            </div>
            <div class="user-info-item">
                <div class="info-label"><i class="fas fa-envelope"></i> Email</div>
                <div class="info-value">${userData.email || 'Not provided'}</div>
            </div>
            <div class="user-info-item">
                <div class="info-label"><i class="fas fa-balance-scale"></i> Audit Ratio</div>
                <div class="info-value">${parseFloat(userData.auditRatio?.toFixed(1) || '0')}</div>
            </div>
            <div class="user-info-item">
                <div class="info-label"><i class="fas fa-award"></i> Total XP</div>
                <div class="info-value">${formattedTotalXP}</div>
            </div>
        </div>
    `;

    // Draw graphs
    await drawGraphs(userData, totalXP);
}

// New function to calculate total XP using more specific filters
function calculateTotalXP(transactions) {
    // Filter for XP transactions more precisely
    return transactions
        .filter(t => {
            // Only include positive XP transactions
            if (t.type !== 'xp' || t.amount <= 0) return false;
            
            // Only count XP from actual projects (not piscine exercises)
            if (t.path && t.path.includes('/piscine-js/')) return false;
            
            // Make sure the path includes the module path
            return t.path && t.path.includes('/bh-module/');
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

// Helper function to calculate top projects XP
function getTopProjectsXP(transactions) {
    const regex = /\/piscine-[^/]+\//; // Matches "/piscine-<anything>/" anywhere in the path
    
    // Filter and group XP by project
    const projectXP = transactions
        .filter(t => 
            t.type === 'xp' &&
            t.path.includes('bh-module') &&
            !regex.test(t.path))
        .reduce((acc, t) => {
            try {
                const pathParts = t.path.split('/');
                const projectName = pathParts[pathParts.length - 1]
                    .replace(/^project-/, '')
                    .replace(/-/g, ' ');
                acc[projectName] = (acc[projectName] || 0) + t.amount;
            } catch (error) {
                console.error('Error processing transaction:', error);
            }
            return acc;
        }, {});

    // Convert to array, sort by XP amount, and take top 10
    const projectData = Object.entries(projectXP)
        .map(([project, xp]) => ({ project, xp }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10); // Take only top 10 projects

    // Sum up XP from top 10 projects
    return projectData.reduce((sum, project) => sum + project.xp, 0);
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

function getAuthToken() {
    return localStorage.getItem('jwt');
}

async function fetchGraphQLUserData(userId, token) {
    const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Remove quotes if present in the token
            'Authorization': `Bearer ${token.replace(/^"(.*)"$/, '$1')}`
        },
        body: JSON.stringify({
            query: `
                query getUserData($userId: Int!) {
                    user: user_by_pk(id: $userId) {
                        id
                        login
                        firstName
                        lastName
                        email
                        auditRatio
                        totalUp
                        totalDown
                        transactions {
                            id
                            type
                            amount
                            createdAt
                            path
                            objectId
                        }
                        results(
                            where: { grade: { _is_null: false } }
                            order_by: { createdAt: asc }
                        ) {
                            id
                            grade
                            createdAt
                            path
                        }
                    }
                }
                    
            `,
            variables: { userId: parseInt(userId) }
        })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    const result = await response.json();
    console.log('GraphQL Response:', result); // For debugging

    if (result.errors) {
        throw new Error(result.errors[0].message);
    }

    const userData = result.data.user;
    if (!userData) {
        throw new Error('User data not found');
    }

    return userData;
}
