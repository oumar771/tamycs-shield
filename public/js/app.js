// API Configuration
const API_URL = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let passwords = [];
let currentFilter = 'all';
let currentGeneratorMode = 'random';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();

    // Generate initial password suggestions for public section
    generateMultiplePasswords();
});

// Check authentication status
function checkAuthStatus() {
    if (authToken && currentUser) {
        showDashboard();
        loadPasswords();
    } else {
        showPublicSection();
    }
}

// UI Navigation
function showPublicSection() {
    document.getElementById('public-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('login-btn').style.display = 'inline-block';
    document.getElementById('register-btn').style.display = 'inline-block';
    document.getElementById('logout-btn').style.display = 'none';
}

function showDashboard() {
    document.getElementById('public-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('register-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'inline-block';
}

// Modal Functions
function showLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('login-form').reset();
    document.getElementById('login-error').textContent = '';
}

function showRegisterModal() {
    document.getElementById('register-modal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('register-modal').style.display = 'none';
    document.getElementById('register-form').reset();
    document.getElementById('register-error').textContent = '';
}

function showAddPasswordModal() {
    document.getElementById('password-modal-title').textContent = 'Add a password';
    document.getElementById('password-form').reset();
    document.getElementById('password-id').value = '';
    document.getElementById('password-modal').style.display = 'flex';
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('password-form').reset();
}

function showExportModal() {
    document.getElementById('export-modal').style.display = 'flex';
}

function closeExportModal() {
    document.getElementById('export-modal').style.display = 'none';
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            closeLoginModal();
            showDashboard();
            loadPasswords();
            showToast('Login successful!', 'success');
        } else {
            errorEl.textContent = data.error || 'Invalid credentials';
        }
    } catch (error) {
        errorEl.textContent = 'Server connection error';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const errorEl = document.getElementById('register-error');

    if (password !== passwordConfirm) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            closeRegisterModal();
            showDashboard();
            loadPasswords();
            showToast('Account created successfully!', 'success');
        } else {
            errorEl.textContent = data.error || 'Registration error';
        }
    } catch (error) {
        errorEl.textContent = 'Server connection error';
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    passwords = [];
    showPublicSection();
    showToast('Logged out successfully', 'success');
}

// Password Generator - Random Mode
function switchGeneratorTab(mode) {
    currentGeneratorMode = mode;

    // Update tab active state
    document.querySelectorAll('.generator-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === mode) {
            tab.classList.add('active');
        }
    });

    // Show/hide generator content
    document.querySelectorAll('.generator-content').forEach(content => {
        content.classList.remove('active');
    });

    if (mode === 'random') {
        document.getElementById('random-generator').classList.add('active');
        generateMultiplePasswords();
    } else {
        document.getElementById('memorable-generator').classList.add('active');
        generateMultipleMemorablePasswords();
    }
}

function updateRandomLength(value) {
    document.getElementById('random-length-value').textContent = value;
    generateMultiplePasswords();
}

function updateMemorableWords(value) {
    document.getElementById('memorable-words-value').textContent = value;
    generateMultipleMemorablePasswords();
}

async function generateMultiplePasswords() {
    const length = parseInt(document.getElementById('random-length').value);
    const useUppercase = document.getElementById('random-uppercase').checked;
    const useLowercase = document.getElementById('random-lowercase').checked;
    const useNumbers = document.getElementById('random-numbers').checked;
    const useSymbols = document.getElementById('random-symbols').checked;

    const options = {
        mode: 'random',
        length,
        includeUppercase: useUppercase,
        includeLowercase: useLowercase,
        includeNumbers: useNumbers,
        includeSymbols: useSymbols
    };

    try {
        const response = await fetch(`${API_URL}/generator/multiple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options)
        });

        const data = await response.json();

        if (response.ok) {
            displayPasswordSuggestions(data.passwords, 'password-suggestions-list');
        }
    } catch (error) {
        console.error('Error generating passwords:', error);
    }
}

async function generateMultipleMemorablePasswords() {
    const wordCount = parseInt(document.getElementById('memorable-words').value);
    const separator = document.getElementById('memorable-separator').value;
    const capitalizeWords = document.getElementById('memorable-capitalize').checked;
    const includeNumbers = document.getElementById('memorable-numbers').checked;

    const options = {
        mode: 'memorable',
        wordCount,
        separator,
        capitalizeWords,
        includeNumbers
    };

    try {
        const response = await fetch(`${API_URL}/generator/multiple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options)
        });

        const data = await response.json();

        if (response.ok) {
            displayPasswordSuggestions(data.passwords, 'memorable-suggestions-list');
        }
    } catch (error) {
        console.error('Error generating memorable passwords:', error);
    }
}

function displayPasswordSuggestions(suggestions, containerId) {
    const container = document.getElementById(containerId);

    container.innerHTML = suggestions.map(item => `
        <div class="password-suggestion">
            <div class="password-suggestion-header">
                <div class="password-strength-badge strength-${item.strength.toLowerCase().replace(' ', '-')}">
                    ${getStrengthIcon(item.strength)} ${translateStrength(item.strength)}
                </div>
                <span class="password-entropy">${Math.round(item.entropy)} bits</span>
            </div>
            <div class="password-suggestion-value" title="${escapeHtml(item.password)}">
                ${escapeHtml(item.password)}
            </div>
            <div class="password-suggestion-footer">
                <span class="crack-time">${item.crackTime}</span>
                <button class="btn-copy" onclick="copyToClipboard('${escapeHtml(item.password).replace(/'/g, "\\'")}', event)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                </button>
            </div>
        </div>
    `).join('');
}

function translateStrength(strength) {
    const map = {
        'Très faible': 'Very weak',
        'Faible': 'Weak',
        'Moyen': 'Fair',
        'Fort': 'Strong',
        'Très fort': 'Very strong'
    };
    return map[strength] || strength;
}

function getStrengthIcon(strength) {
    const icons = {
        'Très faible': '🔴',
        'Faible': '🟠',
        'Moyen': '🟡',
        'Fort': '🟢',
        'Très fort': '🟢',
        'Very weak': '🔴',
        'Weak': '🟠',
        'Fair': '🟡',
        'Strong': '🟢',
        'Very strong': '🟢'
    };
    return icons[strength] || '⚪';
}

async function copyToClipboard(text, event) {
    if (event) {
        event.stopPropagation();
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast('Password copied!', 'success');
    } catch (error) {
        showToast('Copy error', 'error');
    }
}

// Password Management
async function loadPasswords() {
    try {
        const response = await fetch(`${API_URL}/passwords`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            passwords = await response.json();
            displayPasswords();
            updateCategoryCounts();
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error loading passwords:', error);
    }
}

function displayPasswords() {
    const container = document.getElementById('passwords-list');
    const emptyState = document.getElementById('empty-state');

    let filteredPasswords = passwords;
    if (currentFilter !== 'all') {
        filteredPasswords = passwords.filter(p => p.category === currentFilter);
    }

    if (filteredPasswords.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = filteredPasswords.map(password => `
        <div class="password-card">
            <div class="password-card-header">
                <div class="password-card-icon">
                    ${getCategoryIcon(password.category)}
                </div>
                <div class="password-card-info">
                    <h3>${escapeHtml(password.name)}</h3>
                    <p>${escapeHtml(password.username)}</p>
                </div>
            </div>
            <div class="password-card-actions">
                <button onclick="copyPasswordById('${password._id}')" class="btn-action" title="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button onclick="editPassword('${password._id}')" class="btn-action" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button onclick="deletePassword('${password._id}')" class="btn-action" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function updateCategoryCounts() {
    const counts = {
        all: passwords.length,
        social: passwords.filter(p => p.category === 'social').length,
        email: passwords.filter(p => p.category === 'email').length,
        banking: passwords.filter(p => p.category === 'banking').length,
        work: passwords.filter(p => p.category === 'work').length,
        shopping: passwords.filter(p => p.category === 'shopping').length
    };

    Object.entries(counts).forEach(([category, count]) => {
        const el = document.getElementById(`count-${category}`);
        if (el) {
            el.textContent = count;
        }
    });
}

function filterByCategory(category) {
    currentFilter = category;

    // Update active state
    document.querySelectorAll('#categories-list li').forEach(li => {
        li.classList.remove('active');
    });
    event.target.closest('li').classList.add('active');

    displayPasswords();
}

function searchPasswords() {
    const query = document.getElementById('search-input').value.toLowerCase();

    if (!query) {
        displayPasswords();
        return;
    }

    const filtered = passwords.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.username.toLowerCase().includes(query) ||
        (p.url && p.url.toLowerCase().includes(query))
    );

    const container = document.getElementById('passwords-list');
    const emptyState = document.getElementById('empty-state');

    if (filtered.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = filtered.map(password => `
        <div class="password-card">
            <div class="password-card-header">
                <div class="password-card-icon">
                    ${getCategoryIcon(password.category)}
                </div>
                <div class="password-card-info">
                    <h3>${escapeHtml(password.name)}</h3>
                    <p>${escapeHtml(password.username)}</p>
                </div>
            </div>
            <div class="password-card-actions">
                <button onclick="copyPasswordById('${password._id}')" class="btn-action" title="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button onclick="editPassword('${password._id}')" class="btn-action" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button onclick="deletePassword('${password._id}')" class="btn-action" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

async function copyPasswordById(id) {
    const password = passwords.find(p => p._id === id);
    if (!password) return;

    try {
        await navigator.clipboard.writeText(password.password);
        showToast('Password copied!', 'success');
    } catch (error) {
        showToast('Copy error', 'error');
    }
}

function editPassword(id) {
    const password = passwords.find(p => p._id === id);
    if (!password) return;

    document.getElementById('password-modal-title').textContent = 'Edit password';
    document.getElementById('password-id').value = password._id;
    document.getElementById('password-name').value = password.name;
    document.getElementById('password-url').value = password.url || '';
    document.getElementById('password-username').value = password.username;
    document.getElementById('password-value').value = password.password;
    document.getElementById('password-category').value = password.category;
    document.getElementById('password-notes').value = password.notes || '';

    document.getElementById('password-modal').style.display = 'flex';
}

async function deletePassword(id) {
    if (!confirm('Are you sure you want to delete this password?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/passwords/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            await loadPasswords();
            showToast('Password deleted', 'success');
        } else {
            showToast('Deletion error', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
    }
}

async function handleSavePassword(e) {
    e.preventDefault();

    const id = document.getElementById('password-id').value;
    const passwordData = {
        name: document.getElementById('password-name').value,
        url: document.getElementById('password-url').value,
        username: document.getElementById('password-username').value,
        password: document.getElementById('password-value').value,
        category: document.getElementById('password-category').value,
        notes: document.getElementById('password-notes').value
    };

    try {
        const url = id ? `${API_URL}/passwords/${id}` : `${API_URL}/passwords`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(passwordData)
        });

        if (response.ok) {
            closePasswordModal();
            await loadPasswords();
            showToast(id ? 'Password updated' : 'Password added', 'success');
        } else {
            showToast('Save error', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
    }
}

async function generatePasswordForModal() {
    try {
        const response = await fetch(`${API_URL}/generator/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'random',
                length: 16,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSymbols: true
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('password-value').value = data.password;
            showToast(`Strength: ${translateStrength(data.strength)} (${Math.round(data.entropy)} bits)`, 'success');
        }
    } catch (error) {
        console.error('Error generating password:', error);
    }
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

function sortPasswords() {
    const sortBy = document.getElementById('sort-select').value;

    switch(sortBy) {
        case 'name':
            passwords.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'category':
            passwords.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'recent':
        default:
            passwords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }

    displayPasswords();
}

// Export Functions
async function exportData(format) {
    try {
        const response = await fetch(`${API_URL}/export/passwords/${format}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tamycs-shield-passwords-${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            closeExportModal();
            showToast('Export successful!', 'success');
        } else {
            showToast('Export error', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
    }
}

// Utility Functions
function getCategoryIcon(category) {
    const icons = {
        'social': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        'email': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
        'banking': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
        'work': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        'shopping': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
        'other': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
    };
    return icons[category] || icons['other'];
}

function getCategoryLabel(category) {
    const labels = {
        'social': 'Social Networks',
        'email': 'Email',
        'banking': 'Banking',
        'work': 'Work',
        'shopping': 'Shopping',
        'other': 'Other'
    };
    return labels[category] || category;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Dashboard Generator Functions
function showGeneratorSection() {
    document.getElementById('generator-dashboard-modal').style.display = 'flex';
    generateDashboardPasswords();
}

function closeGeneratorDashboardModal() {
    document.getElementById('generator-dashboard-modal').style.display = 'none';
}

function switchDashboardGeneratorTab(mode) {
    // Update tab active state
    document.querySelectorAll('#generator-dashboard-modal .generator-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === mode) {
            tab.classList.add('active');
        }
    });

    // Show/hide generator content
    document.querySelectorAll('#generator-dashboard-modal .generator-content').forEach(content => {
        content.classList.remove('active');
    });

    if (mode === 'random') {
        document.getElementById('dashboard-random-generator').classList.add('active');
        generateDashboardPasswords();
    } else {
        document.getElementById('dashboard-memorable-generator').classList.add('active');
        generateDashboardMemorablePasswords();
    }
}

function updateDashboardRandomLength(value) {
    document.getElementById('dashboard-random-length-value').textContent = value;
    generateDashboardPasswords();
}

function updateDashboardMemorableWords(value) {
    document.getElementById('dashboard-memorable-words-value').textContent = value;
    generateDashboardMemorablePasswords();
}

async function generateDashboardPasswords() {
    const length = parseInt(document.getElementById('dashboard-random-length').value);
    const useUppercase = document.getElementById('dashboard-random-uppercase').checked;
    const useLowercase = document.getElementById('dashboard-random-lowercase').checked;
    const useNumbers = document.getElementById('dashboard-random-numbers').checked;
    const useSymbols = document.getElementById('dashboard-random-symbols').checked;

    const options = {
        mode: 'random',
        length,
        includeUppercase: useUppercase,
        includeLowercase: useLowercase,
        includeNumbers: useNumbers,
        includeSymbols: useSymbols
    };

    try {
        const response = await fetch(`${API_URL}/generator/multiple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            body: JSON.stringify(options)
        });

        const data = await response.json();

        if (response.ok) {
            displayPasswordSuggestions(data.passwords, 'dashboard-password-suggestions-list');
        }
    } catch (error) {
        console.error('Error generating passwords:', error);
    }
}

async function generateDashboardMemorablePasswords() {
    const wordCount = parseInt(document.getElementById('dashboard-memorable-words').value);
    const separator = document.getElementById('dashboard-memorable-separator').value;
    const capitalizeWords = document.getElementById('dashboard-memorable-capitalize').checked;
    const includeNumbers = document.getElementById('dashboard-memorable-numbers').checked;

    const options = {
        mode: 'memorable',
        wordCount,
        separator,
        capitalizeWords,
        includeNumbers
    };

    try {
        const response = await fetch(`${API_URL}/generator/multiple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            body: JSON.stringify(options)
        });

        const data = await response.json();

        if (response.ok) {
            displayPasswordSuggestions(data.passwords, 'dashboard-memorable-suggestions-list');
        }
    } catch (error) {
        console.error('Error generating memorable passwords:', error);
    }
}
