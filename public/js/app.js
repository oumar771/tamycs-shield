/**
 * Application de Gestion de Comptes Utilisateurs
 * Projet Programmation Sécurisée - ESAIP
 *
 * Ce fichier gère la logique frontend de l'application :
 * - Authentification (connexion/inscription)
 * - Gestion du profil utilisateur
 * - Administration des utilisateurs (pour les admins)
 *
 * SÉCURITÉ : Le token JWT est stocké dans un cookie HTTP-only côté serveur.
 * Le frontend ne manipule plus le token directement, ce qui protège contre les attaques XSS.
 */

// Configuration de l'API
const API_URL = '/api';

// État de l'application (l'utilisateur connecté)
let currentUser = null;

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise l'application au chargement de la page
 * Vérifie si une session est active en appelant /api/auth/me
 */
document.addEventListener('DOMContentLoaded', function() {
    // Attacher les événements aux boutons
    initEventListeners();

    // Vérifier si l'utilisateur a une session active (cookie valide)
    checkSession();
});

/**
 * Vérifie si l'utilisateur a une session active
 * Le serveur vérifie le cookie HTTP-only et renvoie les infos utilisateur
 */
async function checkSession() {
    try {
        var response = await fetch(API_URL + '/auth/me', {
            credentials: 'include' // Inclure les cookies dans la requête
        });

        if (response.ok) {
            var data = await response.json();
            currentUser = data.user;
            showDashboard();
        }
        // Si pas de session valide, on reste sur la page publique
    } catch (error) {
        // Erreur réseau, on reste sur la page publique
        console.log('Pas de session active');
    }
}

/**
 * Initialise tous les écouteurs d'événements
 */
function initEventListeners() {
    // Boutons de la navbar
    document.getElementById('btn-login').addEventListener('click', function() {
        showModal('login-modal');
    });

    document.getElementById('btn-register').addEventListener('click', function() {
        showModal('register-modal');
    });

    document.getElementById('btn-logout').addEventListener('click', logout);

    // Formulaires
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    document.getElementById('password-form').addEventListener('submit', changePassword);
    document.getElementById('role-form').addEventListener('submit', updateUserRole);

    // Boutons de fermeture des modales
    document.querySelectorAll('.modal-close').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Liens dans les modales
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

    // Navigation sidebar
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

    // Fermer la modale en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });

    // Fermer les modales avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(function(modal) {
                modal.classList.remove('show');
            });
        }
    });
}

// ============================================
// GESTION DES MODALES
// ============================================

/**
 * Affiche une modale par son ID
 */
function showModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Ferme une modale par son ID
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
// AUTHENTIFICATION
// ============================================

/**
 * Gère la soumission du formulaire de connexion
 * Le token est stocké dans un cookie HTTP-only par le serveur
 */
async function handleLogin(event) {
    event.preventDefault();

    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;
    var errorDiv = document.getElementById('login-error');

    if (!email || !password) {
        showError(errorDiv, 'Veuillez remplir tous les champs');
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Permet au serveur de définir le cookie
            body: JSON.stringify({ email: email, password: password })
        });

        var data = await response.json();

        if (!response.ok) {
            showError(errorDiv, data.error || 'Identifiants incorrects');
            return;
        }

        // Le token est maintenant dans un cookie HTTP-only
        // On stocke uniquement les infos utilisateur (pas sensibles)
        currentUser = data.user;

        closeModal('login-modal');
        showDashboard();
        showToast('Connexion réussie', 'success');

    } catch (error) {
        showError(errorDiv, 'Erreur de connexion au serveur');
    }
}

/**
 * Gère la soumission du formulaire d'inscription
 * Le token est stocké dans un cookie HTTP-only par le serveur
 */
async function handleRegister(event) {
    event.preventDefault();

    var name = document.getElementById('register-name').value.trim();
    var email = document.getElementById('register-email').value.trim();
    var password = document.getElementById('register-password').value;
    var confirm = document.getElementById('register-confirm').value;
    var errorDiv = document.getElementById('register-error');

    if (!name || !email || !password || !confirm) {
        showError(errorDiv, 'Veuillez remplir tous les champs');
        return;
    }

    if (password.length < 8) {
        showError(errorDiv, 'Le mot de passe doit contenir au moins 8 caractères');
        return;
    }

    if (password !== confirm) {
        showError(errorDiv, 'Les mots de passe ne correspondent pas');
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Permet au serveur de définir le cookie
            body: JSON.stringify({ name: name, email: email, password: password })
        });

        var data = await response.json();

        if (!response.ok) {
            showError(errorDiv, data.error || 'Erreur lors de l\'inscription');
            return;
        }

        // Le token est maintenant dans un cookie HTTP-only
        currentUser = data.user;

        closeModal('register-modal');
        showDashboard();
        showToast('Compte créé avec succès', 'success');

    } catch (error) {
        showError(errorDiv, 'Erreur de connexion au serveur');
    }
}

/**
 * Déconnecte l'utilisateur
 * Appelle le serveur pour supprimer le cookie HTTP-only
 */
async function logout() {
    try {
        await fetch(API_URL + '/auth/logout', {
            method: 'POST',
            credentials: 'include' // Envoie le cookie au serveur pour suppression
        });
    } catch (error) {
        // Même en cas d'erreur, on déconnecte côté client
    }

    currentUser = null;

    document.getElementById('public-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-nav').style.display = 'none';

    showToast('Déconnexion réussie', 'success');
}

// ============================================
// INTERFACE UTILISATEUR
// ============================================

/**
 * Affiche le tableau de bord après connexion
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
 * Affiche une vue spécifique dans le dashboard
 */
function showView(viewName, clickedLink) {
    // Masquer toutes les vues
    document.querySelectorAll('.view').forEach(function(view) {
        view.style.display = 'none';
    });

    // Afficher la vue demandée
    var view = document.getElementById('view-' + viewName);
    if (view) {
        view.style.display = 'block';
    }

    // Mettre à jour le menu actif
    document.querySelectorAll('.sidebar-menu a').forEach(function(link) {
        link.classList.remove('active');
    });
    if (clickedLink) {
        clickedLink.classList.add('active');
    }

    // Charger les données selon la vue
    if (viewName === 'users' && currentUser.role === 'admin') {
        loadUsers();
    } else if (viewName === 'security') {
        loadSecurityInfo();
    }
}

// ============================================
// GESTION DU PROFIL
// ============================================

/**
 * Charge et affiche les informations du profil utilisateur
 */
function loadProfile() {
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

    document.getElementById('profile-name-input').value = currentUser.name;
    document.getElementById('profile-email-input').value = currentUser.email;
}

/**
 * Met à jour les informations du profil utilisateur
 */
async function updateProfile(event) {
    event.preventDefault();

    var name = document.getElementById('profile-name-input').value.trim();
    var email = document.getElementById('profile-email-input').value.trim();

    if (!name || !email) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Envoie le cookie d'authentification
            body: JSON.stringify({ name: name, email: email })
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Erreur lors de la mise à jour', 'error');
            return;
        }

        currentUser.name = name;
        currentUser.email = email;

        loadProfile();
        document.getElementById('user-display-name').textContent = name;

        showToast('Profil mis à jour', 'success');

    } catch (error) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

/**
 * Charge les informations de sécurité du compte
 */
function loadSecurityInfo() {
    if (currentUser.createdAt) {
        var date = new Date(currentUser.createdAt);
        document.getElementById('account-created').textContent = date.toLocaleDateString('fr-FR');
    }

    if (currentUser.lastLogin) {
        var date = new Date(currentUser.lastLogin);
        document.getElementById('last-login').textContent = date.toLocaleString('fr-FR');
    } else {
        document.getElementById('last-login').textContent = 'Première connexion';
    }
}

/**
 * Change le mot de passe de l'utilisateur
 */
async function changePassword(event) {
    event.preventDefault();

    var currentPassword = document.getElementById('current-password').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showToast('Le nouveau mot de passe doit contenir au moins 8 caractères', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('Les nouveaux mots de passe ne correspondent pas', 'error');
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
            showToast(data.error || 'Erreur lors du changement de mot de passe', 'error');
            return;
        }

        document.getElementById('password-form').reset();
        showToast('Mot de passe modifié avec succès', 'success');

    } catch (error) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ============================================
// ADMINISTRATION - GESTION DES UTILISATEURS
// ============================================

/**
 * Charge la liste de tous les utilisateurs (admin uniquement)
 */
async function loadUsers() {
    try {
        var response = await fetch(API_URL + '/auth/users', {
            credentials: 'include'
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Erreur lors du chargement', 'error');
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
            html += '<td><span class="badge badge-' + user.role + '">' + (user.role === 'admin' ? 'Admin' : 'Utilisateur') + '</span></td>';
            html += '<td>' + new Date(user.createdAt).toLocaleDateString('fr-FR') + '</td>';
            html += '<td class="table-actions">';
            html += '<button class="btn btn-sm btn-secondary" data-action="edit-role" data-user-id="' + user.id + '" data-user-role="' + user.role + '">Modifier rôle</button>';
            if (user.id !== currentUser.id) {
                html += ' <button class="btn btn-sm btn-danger" data-action="delete-user" data-user-id="' + user.id + '">Supprimer</button>';
            }
            html += '</td>';
            html += '</tr>';
        });
        tbody.innerHTML = html;

        // Attacher les événements aux boutons
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
        showToast('Erreur de connexion au serveur', 'error');
    }
}

/**
 * Ouvre la modale pour modifier le rôle d'un utilisateur
 */
function editUserRole(userId, currentRole) {
    document.getElementById('role-user-id').value = userId;
    document.getElementById('role-select').value = currentRole;
    showModal('role-modal');
}

/**
 * Met à jour le rôle d'un utilisateur
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
            showToast(data.error || 'Erreur lors de la mise à jour', 'error');
            return;
        }

        closeModal('role-modal');
        loadUsers();
        showToast('Rôle mis à jour', 'success');

    } catch (error) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

/**
 * Supprime un utilisateur (admin uniquement)
 */
async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }

    try {
        var response = await fetch(API_URL + '/auth/users/' + userId, {
            method: 'DELETE',
            credentials: 'include'
        });

        var data = await response.json();

        if (!response.ok) {
            showToast(data.error || 'Erreur lors de la suppression', 'error');
            return;
        }

        loadUsers();
        showToast('Utilisateur supprimé', 'success');

    } catch (error) {
        showToast('Erreur de connexion au serveur', 'error');
    }
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Affiche un message d'erreur dans un élément HTML
 */
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

/**
 * Affiche une notification toast
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
 * Échappe les caractères HTML pour prévenir les attaques XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
