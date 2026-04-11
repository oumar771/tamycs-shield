/**
 * User Account Management Application
 * Secure Programming Project - ESAIP
 *
 * This file handles the frontend logic of the application:
 * - Authentication (login/registration)
 * - User profile management
 * - User administration (for admins)
 *
 * SECURITY: The JWT token is stored in an HTTP-only cookie server-side.
 * The frontend does not handle the token directly, which protects against XSS attacks.
 */

// API configuration
const API_URL = '/api';

// Application state (logged-in user)
let currentUser = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initializes the application on page load
 * Checks for an active session by calling /api/auth/me
 */
document.addEventListener('DOMContentLoaded', function() {
    // Attach events to buttons
    initEventListeners();

    // Check if the user has an active session (valid cookie)
    checkSession();
});

/**
 * Checks if the user has an active session
 * The server verifies the HTTP-only cookie and returns the user info
 */
async function checkSession() {
    try {
        var response = await fetch(API_URL + '/auth/me', {
            credentials: 'include' // Include cookies in the request
        });

        if (response.ok) {
            var data = await response.json();
            currentUser = data.user;
            showDashboard();
        }
        // If no valid session, stay on the public page
    } catch (error) {
        // Network error, stay on the public page
        console.log('No active session');
    }
}

/**
 * Initializes all event listeners
 */
function initEventListeners() {
    // Navbar buttons
    document.getElementById('btn-login').addEventListener('click', function() {
        showModal('login-modal');
    });

    document.getElementById('btn-register').addEventListener('click', function() {
        showModal('register-modal');
    });

    document.getElementById('btn-logout').addEventListener('click', logout);

    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    document.getElementById('password-form').addEventListener('submit', changePassword);
    document.getElementById('role-form').addEventListener('submit', updateUserRole);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Modal links
    document.getElementById('link-to-register').addEventListener('click', function(e) {
        e.preventDefault();
        closeModal('login-modal');
        showModal('register-modal');
    });

    document.getElementById('link-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        closeModal('register-modal');
        showModal('login-modal');
    });

    // Sidebar navigation
    document.getElementById('nav-profile').addEventListener('click', function(e) {
        e.preventDefault();
        showView('profile', this);
    });

    document.getElementById('nav-security').addEventListener('click', function(e) {
        e.preventDefault();
        showView('security', this);
    });

    document.getElementById('nav-users').addEventListener('click', function(e) {
        e.preventDefault();
        showView('users', this);
    });

    // Close modal by clicking outside
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(function(modal) {
                modal.classList.remove('show');
            });
        }
    });
}

// ============================================
// MODAL MANAGEMENT
// ============================================

/**
 * Shows a modal by its ID
 */
function showModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Closes a modal by its ID
 */
function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        var form = modal.querySelector('form');
        if (form) form.reset();
        var error = modal.querySelector('.alert-error');
        if (error) error.style.display = 'none';
    }
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Handles the login form submission
 * The token is stored in an HTTP-only cookie by the server
 */
async function handleLogin(event) {
    event.preventDefault();

    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;
    var errorDiv = document.getElementById('login-error');

    if (!email || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Allows the server to set the cookie
            body: JSON.stringify({ email: email, password: password })
        });

        var data = await response.json();

        if (!response.ok) {
            showError(errorDiv, data.error || 'Invalid credentials');
            return;
        }

        // The token is now in an HTTP-only cookie
        // We only store non-sensitive user info
        currentUser = data.user;

        closeModal('login-modal');
        showDashboard();
        showToast('Login successful', 'success');

    } catch (error) {
        showError(errorDiv, 'Server connection error');
    }
}

/**
 * Handles the registration form submission
 * The token is stored in an HTTP-only cookie by the server
 */
async function handleRegister(event) {
    event.preventDefault();

    var name = document.getElementById('register-name').value.trim();
    var email = document.getElementById('register-email').value.trim();
    var password = document.getElementById('register-password').value;
    var confirm = document.getElementById('register-confirm').value;
    var errorDiv = document.getElementById('register-error');

    if (!name || !email || !password || !confirm) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }

    if (password.length < 8) {
        showError(errorDiv, 'Password must be at least 8 characters long');
        return;
    }

    if (password !== confirm) {
        showError(errorDiv, 'Passwords do not match');
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Allows the server to set the cookie
            body: JSON.stringify({ name: name, email: email, password: password })
        });

        var data = await response.json();

        if (!response.ok) {
            showError(errorDiv, data.error || 'Registration error');
            return;
        }

        // The token is now in an HTTP-only cookie
        currentUser = data.user;

        closeModal('register-modal');
        showDashboard();
        showToast('Account created successfully', 'success');

    } catch (error) {
        showError(errorDiv, 'Server connection error');
    }
}

/**
 * Logs out the user
 * Calls the server to delete the HTTP-only cookie
 */
async function logout() {
    try {
        await fetch(API_URL + '/auth/logout', {
            method: 'POST',
            credentials: 'include' // Sends the cookie to the server for deletion
        });
    } catch (error) {
        // Even on error, log out client-side
    }

    currentUser = null;

    document.getElementById('public-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-nav').style.display = 'none';

    showToast('Logged out successfully', 'success');
}

// ============================================
// USER INTERFACE
// ============================================

/**
 * Shows the dashboard after login
 */
function showDashboard() {
    document.getElementById('public-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';

    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('user-nav').style.display = 'flex';
    document.getElementById('user-display-name').textContent = currentUser.name;

    var roleBadge = document.getElementById('user-role-badge');
    roleBadge.textContent = currentUser.role === 'admin' ? 'ADMIN' : 'USER';
    roleBadge.className = 'user-role ' + currentUser.role;

    var adminMenu = document.getElementById('admin-menu');
    if (currentUser.role === 'admin') {
        adminMenu.style.display = 'block';
    } else {
        adminMenu.style.display = 'none';
    }

    loadProfile();
}

/**
 * Shows a specific view in the dashboard
 */
function showView(viewName, clickedLink) {
    // Hide all views
    document.querySelectorAll('.view').forEach(function(view) {
        view.style.display = 'none';
    });

    // Show the requested view
    var view = document.getElementById('view-' + viewName);
    if (view) {
        view.style.display = 'block';
    }

    // Update the active menu item
    document.querySelectorAll('.sidebar-menu a').forEach(function(link) {
        link.classList.remove('active');
    });
    if (clickedLink) {
        clickedLink.classList.add('active');
    }

    // Load data based on view
    if (viewName === 'users' && currentUser.role === 'admin') {
        loadUsers();
    } else if (viewName === 'security') {
        loadSecurityInfo();
    }
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

/**
 * Loads and displays user profile information
 */
function loadProfile() {
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

    document.getElementById('profile-name-input').value = currentUser.name;
    document.getElementById('profile-email-input').value = currentUser.email;
}

/**
 * Updates the user profile information
 */
async function updateProfile(event) {
    event.preventDefault();

    var name = document.getElementById('profile-name-input').value.trim();
    var email = document.getElementById('profile-email-input').value.trim();

    if (!name || !email) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Sends the authentication cookie
            body: JSON.stringify({ name: name, email: email })
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Update error', 'error');
            return;
        }

        currentUser.name = name;
        currentUser.email = email;

        loadProfile();
        document.getElementById('user-display-name').textContent = name;

        showToast('Profile updated', 'success');

    } catch (error) {
        showToast('Server connection error', 'error');
    }
}

/**
 * Loads the account security information
 */
function loadSecurityInfo() {
    if (currentUser.createdAt) {
        var date = new Date(currentUser.createdAt);
        document.getElementById('account-created').textContent = date.toLocaleDateString('en-US');
    }

    if (currentUser.lastLogin) {
        var date = new Date(currentUser.lastLogin);
        document.getElementById('last-login').textContent = date.toLocaleString('en-US');
    } else {
        document.getElementById('last-login').textContent = 'First login';
    }
}

/**
 * Changes the user's password
 */
async function changePassword(event) {
    event.preventDefault();

    var currentPassword = document.getElementById('current-password').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters long', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Password change error', 'error');
            return;
        }

        document.getElementById('password-form').reset();
        showToast('Password changed successfully', 'success');

    } catch (error) {
        showToast('Server connection error', 'error');
    }
}

// ============================================
// ADMINISTRATION - USER MANAGEMENT
// ============================================

/**
 * Loads the list of all users (admin only)
 */
async function loadUsers() {
    try {
        var response = await fetch(API_URL + '/auth/users', {
            credentials: 'include'
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Loading error', 'error');
            return;
        }

        var totalUsers = data.users.length;
        var adminUsers = data.users.filter(function(u) { return u.role === 'admin'; }).length;
        document.getElementById('stat-total-users').textContent = totalUsers;
        document.getElementById('stat-admin-users').textContent = adminUsers;

        var tbody = document.getElementById('users-table-body');
        var emptyState = document.getElementById('users-empty');

        if (data.users.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        var html = '';
        data.users.forEach(function(user) {
            html += '<tr>';
            html += '<td>' + escapeHtml(user.name) + '</td>';
            html += '<td>' + escapeHtml(user.email) + '</td>';
            html += '<td><span class="badge badge-' + user.role + '">' + (user.role === 'admin' ? 'Admin' : 'User') + '</span></td>';
            html += '<td>' + new Date(user.createdAt).toLocaleDateString('en-US') + '</td>';
            html += '<td class="table-actions">';
            html += '<button class="btn btn-sm btn-secondary" data-action="edit-role" data-user-id="' + user.id + '" data-user-role="' + user.role + '">Edit role</button>';
            if (user.id !== currentUser.id) {
                html += ' <button class="btn btn-sm btn-danger" data-action="delete-user" data-user-id="' + user.id + '">Delete</button>';
            }
            html += '</td>';
            html += '</tr>';
        });
        tbody.innerHTML = html;

        // Attach events to buttons
        tbody.querySelectorAll('[data-action="edit-role"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                editUserRole(this.getAttribute('data-user-id'), this.getAttribute('data-user-role'));
            });
        });

        tbody.querySelectorAll('[data-action="delete-user"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                deleteUser(this.getAttribute('data-user-id'));
            });
        });

    } catch (error) {
        showToast('Server connection error', 'error');
    }
}

/**
 * Opens the modal to edit a user's role
 */
function editUserRole(userId, currentRole) {
    document.getElementById('role-user-id').value = userId;
    document.getElementById('role-select').value = currentRole;
    showModal('role-modal');
}

/**
 * Updates a user's role
 */
async function updateUserRole(event) {
    event.preventDefault();

    var userId = document.getElementById('role-user-id').value;
    var role = document.getElementById('role-select').value;

    try {
        var response = await fetch(API_URL + '/auth/users/' + userId + '/role', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ role: role })
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Update error', 'error');
            return;
        }

        closeModal('role-modal');
        loadUsers();
        showToast('Role updated', 'success');

    } catch (error) {
        showToast('Server connection error', 'error');
    }
}

/**
 * Deletes a user (admin only)
 */
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/users/' + userId, {
            method: 'DELETE',
            credentials: 'include'
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Deletion error', 'error');
            return;
        }

        loadUsers();
        showToast('User deleted', 'success');

    } catch (error) {
        showToast('Server connection error', 'error');
    }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Displays an error message in an HTML element
 */
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

/**
 * Displays a toast notification
 */
function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast toast-' + (type || 'info') + ' show';

    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Escapes HTML characters to prevent XSS attacks
 */
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
