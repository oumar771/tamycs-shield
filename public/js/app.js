// API Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let passwords = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken && currentUser) {
        showAppSection();
        loadPasswords();
    } else {
        showAuthSection();
    }

    // Set up form handlers
    setupFormHandlers();
});

function setupFormHandlers() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Password form
    document.getElementById('password-form').addEventListener('submit', handlePasswordSubmit);
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

            showAppSection();
            loadPasswords();
        } else {
            showError(errorEl, data.error || 'Identifiants incorrects');
        }
    } catch (error) {
        showError(errorEl, 'Erreur de connexion au serveur');
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
        showError(errorEl, 'Les mots de passe ne correspondent pas');
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

            showAppSection();
            loadPasswords();
        } else {
            showError(errorEl, data.error || 'Erreur lors de l\'inscription');
        }
    } catch (error) {
        showError(errorEl, 'Erreur de connexion au serveur');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuthSection();
}

// UI Navigation
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('app-section').style.display = 'none';
}

function showAppSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.name || currentUser.email;
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
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
            updateCategories();
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error loading passwords:', error);
    }
}

function displayPasswords() {
    const container = document.getElementById('passwords-list');

    let filteredPasswords = passwords;
    if (currentFilter !== 'all') {
        filteredPasswords = passwords.filter(p => p.category === currentFilter);
    }

    if (filteredPasswords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Aucun mot de passe</h3>
                <p>Cliquez sur "Nouveau mot de passe" pour commencer</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredPasswords.map(password => `
        <div class="password-card">
            <div class="password-card-header">
                <div class="password-card-title">${escapeHtml(password.name)}</div>
                <span class="password-card-category">${getCategoryLabel(password.category)}</span>
            </div>
            <div class="password-card-username">${escapeHtml(password.username)}</div>
            <div class="password-card-value">""""""""""""</div>
            <div class="password-card-actions">
                <button onclick="viewPassword('${password._id}')" class="btn btn-primary btn-small">Voir</button>
                <button onclick="copyPassword('${password._id}')" class="btn btn-secondary btn-small">Copier</button>
                <button onclick="editPassword('${password._id}')" class="btn btn-secondary btn-small">Modifier</button>
                <button onclick="deletePassword('${password._id}')" class="btn btn-secondary btn-small">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function updateCategories() {
    const categories = [...new Set(passwords.map(p => p.category))];
    const categoriesList = document.getElementById('categories-list');

    categoriesList.innerHTML = `
        <li><a href="#" onclick="filterByCategory('all'); return false;" class="${currentFilter === 'all' ? 'active' : ''}">Tous (${passwords.length})</a></li>
        ${categories.map(cat => {
            const count = passwords.filter(p => p.category === cat).length;
            return `<li><a href="#" onclick="filterByCategory('${cat}'); return false;" class="${currentFilter === cat ? 'active' : ''}">${getCategoryLabel(cat)} (${count})</a></li>`;
        }).join('')}
    `;
}

function filterByCategory(category) {
    currentFilter = category;
    displayPasswords();
    updateCategories();
}

function searchPasswords() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('passwords-list');

    if (!query) {
        displayPasswords();
        return;
    }

    const filtered = passwords.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.username.toLowerCase().includes(query) ||
        (p.url && p.url.toLowerCase().includes(query))
    );

    container.innerHTML = filtered.map(password => `
        <div class="password-card">
            <div class="password-card-header">
                <div class="password-card-title">${escapeHtml(password.name)}</div>
                <span class="password-card-category">${getCategoryLabel(password.category)}</span>
            </div>
            <div class="password-card-username">${escapeHtml(password.username)}</div>
            <div class="password-card-value">""""""""""""</div>
            <div class="password-card-actions">
                <button onclick="viewPassword('${password._id}')" class="btn btn-primary btn-small">Voir</button>
                <button onclick="copyPassword('${password._id}')" class="btn btn-secondary btn-small">Copier</button>
                <button onclick="editPassword('${password._id}')" class="btn btn-secondary btn-small">Modifier</button>
                <button onclick="deletePassword('${password._id}')" class="btn btn-secondary btn-small">Supprimer</button>
            </div>
        </div>
    `).join('');
}

async function viewPassword(id) {
    const password = passwords.find(p => p._id === id);
    if (!password) return;

    alert(`Nom: ${password.name}\nUtilisateur: ${password.username}\nMot de passe: ${password.password}\nURL: ${password.url || 'N/A'}\nNotes: ${password.notes || 'N/A'}`);
}

async function copyPassword(id) {
    const password = passwords.find(p => p._id === id);
    if (!password) return;

    try {
        await navigator.clipboard.writeText(password.password);
        alert('Mot de passe copié dans le presse-papiers!');
    } catch (error) {
        alert('Erreur lors de la copie');
    }
}

function editPassword(id) {
    const password = passwords.find(p => p._id === id);
    if (!password) return;

    document.getElementById('modal-title').textContent = 'Modifier le mot de passe';
    document.getElementById('password-id').value = password._id;
    document.getElementById('password-name').value = password.name;
    document.getElementById('password-url').value = password.url || '';
    document.getElementById('password-username').value = password.username;
    document.getElementById('password-value').value = password.password;
    document.getElementById('password-category').value = password.category;
    document.getElementById('password-notes').value = password.notes || '';

    showPasswordModal();
}

async function deletePassword(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce mot de passe?')) {
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
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        alert('Erreur de connexion');
    }
}

async function handlePasswordSubmit(e) {
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
        } else {
            alert('Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        alert('Erreur de connexion');
    }
}

// Modal Functions
function showAddPasswordModal() {
    document.getElementById('modal-title').textContent = 'Nouveau mot de passe';
    document.getElementById('password-form').reset();
    document.getElementById('password-id').value = '';
    showPasswordModal();
}

function showPasswordModal() {
    document.getElementById('password-modal').classList.add('show');
}

function closePasswordModal() {
    document.getElementById('password-modal').classList.remove('show');
    document.getElementById('password-form').reset();
}

function showGeneratorModal() {
    generatePassword();
    document.getElementById('generator-modal').classList.add('show');
}

function closeGeneratorModal() {
    document.getElementById('generator-modal').classList.remove('show');
}

// Password Generator
function generatePassword() {
    const length = parseInt(document.getElementById('gen-length').value);
    const useUppercase = document.getElementById('gen-uppercase').checked;
    const useLowercase = document.getElementById('gen-lowercase').checked;
    const useNumbers = document.getElementById('gen-numbers').checked;
    const useSymbols = document.getElementById('gen-symbols').checked;

    let chars = '';
    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (chars === '') {
        alert('Veuillez sélectionner au moins un type de caractère');
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById('generated-password').value = password;
}

function generatePasswordInModal() {
    const length = 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById('password-value').value = password;
}

async function copyGeneratedPassword() {
    const password = document.getElementById('generated-password').value;
    try {
        await navigator.clipboard.writeText(password);
        alert('Mot de passe copié!');
    } catch (error) {
        alert('Erreur lors de la copie');
    }
}

function updateLengthValue(value) {
    document.getElementById('length-value').textContent = value;
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

// Utility Functions
function getCategoryLabel(category) {
    const labels = {
        'social': 'Réseaux sociaux',
        'email': 'Email',
        'banking': 'Banque',
        'work': 'Travail',
        'shopping': 'Shopping',
        'other': 'Autre'
    };
    return labels[category] || category;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}
