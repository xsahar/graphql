document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        toggleAuthUI(false);
        return;
    }

    try {
        await fetchUserData();
    } catch (error) {
        console.error('Error loading profile:', error);
        if (error.message.includes('token') || error.message.includes('unauthorized')) {
            logout();
        } else {
            alert(`Error loading profile data: ${error.message}`);
        }
    }
});

function toggleAuthUI(isLoggedIn) {
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    if (!loginSection || !profileSection) return;
    loginSection.hidden = isLoggedIn;
    profileSection.hidden = !isLoggedIn;
}

async function fetchUserData() {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');
    const userId = getUserIdFromToken(token);
    if (!userId) throw new Error('Could not get user ID from token');

    const userData = await fetchGraphQLUserData(userId, token);
    const transactions = userData.transactions || [];
    const totalXP = calculateTotalXP(transactions);
    const formattedTotalXP = formatXP(Math.round(totalXP / 1000) * 1000);
    const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.login;

    document.getElementById('username').textContent = displayName;
    document.getElementById('totalXpMetric').textContent = formattedTotalXP;
    document.getElementById('auditMetric').textContent = Number(userData.auditRatio || 0).toFixed(1);
    document.getElementById('projectMetric').textContent = getProjectCount(transactions);
    document.getElementById('profileEmail').textContent = userData.email || `@${userData.login}`;
    document.getElementById('githubLink').href = `https://github.com/${encodeURIComponent(userData.login)}`;

    document.getElementById('xp').innerHTML = `
        <div class="user-info-item"><div class="info-label"><i class="fas fa-user"></i> Username</div><div class="info-value">${escapeHTML(userData.login)}</div></div>
        <div class="user-info-item"><div class="info-label"><i class="fas fa-envelope"></i> Email</div><div class="info-value">${escapeHTML(userData.email || 'Not provided')}</div></div>
        <div class="user-info-item"><div class="info-label"><i class="fas fa-balance-scale"></i> Audit ratio</div><div class="info-value">${Number(userData.auditRatio || 0).toFixed(1)}</div></div>
        <div class="user-info-item"><div class="info-label"><i class="fas fa-award"></i> Total XP</div><div class="info-value">${formattedTotalXP}</div></div>
    `;
    renderLanguagesFromTransactions(transactions);
    await loadGitHubProjects(userData.login);
    await drawGraphs(userData, totalXP);
}

function calculateTotalXP(transactions) {
    return transactions
        .filter(transaction => transaction.type === 'xp' && transaction.amount > 0 && transaction.path && transaction.path.includes('/bh-module/') && !transaction.path.includes('/piscine-js/'))
        .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function getProjectCount(transactions) {
    return new Set(transactions.filter(transaction => transaction.type === 'xp' && transaction.path).map(transaction => transaction.path.split('/').pop())).size || '—';
}

function renderLanguagesFromTransactions(transactions) {
    const languageList = document.getElementById('languageList');
    const languageMap = [
        { match: /javascript|js/i, label: 'JavaScript' },
        { match: /typescript|ts/i, label: 'TypeScript' },
        { match: /graphql/i, label: 'GraphQL' },
        { match: /html/i, label: 'HTML' },
        { match: /css/i, label: 'CSS' },
        { match: /python/i, label: 'Python' }
    ];
    const source = transactions.map(transaction => transaction.path || '').join(' ');
    const languages = languageMap.filter(language => language.match.test(source));
    languageList.innerHTML = (languages.length ? languages : languageMap.slice(0, 4)).map(language => `
        <span class="language-chip"><i class="fas fa-code" aria-hidden="true"></i>${language.label}</span>
    `).join('');
}

async function loadGitHubProjects(login) {
    const projectList = document.getElementById('projectList');
    try {
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated`);
        if (!response.ok) throw new Error('GitHub projects could not be loaded');
        const repositories = await response.json();
        const projects = await Promise.all(repositories.filter(repository => !repository.fork).map(async repository => {
            try {
                const languageResponse = await fetch(repository.languages_url);
                const languages = languageResponse.ok ? Object.keys(await languageResponse.json()).slice(0, 4) : [];
                return { ...repository, languages };
            } catch {
                return { ...repository, languages: repository.language ? [repository.language] : [] };
            }
        }));

        projectList.innerHTML = projects.length ? projects.map(project => `
            <a class="project-showcase" href="${project.html_url}" target="_blank" rel="noopener noreferrer">
                <div class="project-showcase-top"><h3>${escapeHTML(project.name)}</h3><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></div>
                <p>${escapeHTML(project.description || 'A project built as part of my developer journey.')}</p>
                <div class="language-tags">${project.languages.length ? project.languages.map(language => `<span class="language-tag">${escapeHTML(language)}</span>`).join('') : '<span class="language-tag">Code project</span>'}</div>
            </a>
        `).join('') : '<p class="loading-state">No public projects found yet.</p>';

        const languages = [...new Set(projects.flatMap(project => project.languages))].slice(0, 10);
        if (languages.length) {
            document.getElementById('languageList').innerHTML = languages.map(language => `
                <span class="language-chip"><i class="fas fa-code" aria-hidden="true"></i>${escapeHTML(language)}</span>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading GitHub projects:', error);
        projectList.innerHTML = '<p class="loading-state">Project list unavailable right now. Visit the GitHub profile to explore the work.</p>';
    }
}

function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.replace(/^"(.*)"$/, '$1').split('.')[1]));
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
            'Authorization': `Bearer ${token.replace(/^"(.*)"$/, '$1')}`
        },
        body: JSON.stringify({
            query: `query getUserData($userId: Int!) {
                user: user_by_pk(id: $userId) {
                    id login firstName lastName email auditRatio totalUp totalDown
                    transactions { id type amount createdAt path objectId }
                    results(where: { grade: { _is_null: false } }, order_by: { createdAt: asc }) { id grade createdAt path }
                }
            }`,
            variables: { userId: parseInt(userId) }
        })
    });
    if (!response.ok) throw new Error('Failed to fetch user data');
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    if (!result.data.user) throw new Error('User data not found');
    return result.data.user;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}
