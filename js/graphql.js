// Function to send GraphQL queries with JWT authentication
async function sendGraphQLQuery(query, variables = {}, token) {
    if (!token) {
        token = getAuthToken();
    }
    
    // Clean the token if it has quotes
    const cleanToken = token.replace(/^"(.*)"$/, '$1');
    
    const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanToken}`
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }
    
    return result.data;
}

// Function to fetch user data with GraphQL
async function fetchGraphQLUserData(userId, token) {
    const query = `
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
    `;
    
    const data = await sendGraphQLQuery(query, { userId: parseInt(userId) }, token);
    
    if (!data.user) {
        throw new Error('User data not found');
    }
    
    return data.user;
}