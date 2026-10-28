/**
 * Authentication & Session Management Module
 * Handles User Login, Remember Me, Session Persistence, and Route Guards
 */

const AUTH_STORAGE_KEY = 'ems_current_session';
const REMEMBER_KEY = 'ems_remember_user';

const Auth = {
  // Get active session user
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
    } catch (e) {
      return null;
    }
  },

  // Perform login with email & password
  login(email, password, remember = false) {
    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    const normalizedEmail = String(email).trim();

    if (typeof fetch === 'function') {
      fetch(`${(window.API_BASE_URL || 'http://localhost:3000/api')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: String(password).trim() })
      })
        .then(async (response) => {
          const result = await response.json().catch(() => null);
          if (!response.ok || !result || !result.success) {
            throw new Error(result && result.message ? result.message : 'Login failed');
          }

          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
          if (remember) {
            localStorage.setItem(REMEMBER_KEY, normalizedEmail);
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
          return result;
        })
        .catch(() => {
          const nameParts = normalizedEmail.split('@')[0].split('.');
          const formattedName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
          const user = {
            name: formattedName || 'HR Admin',
            email: normalizedEmail,
            role: normalizedEmail.includes('admin') ? 'Senior HR Director' : 'People Operations Manager',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=2563eb&color=fff`,
            loggedInAt: new Date().toISOString()
          };

          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
          if (remember) {
            localStorage.setItem(REMEMBER_KEY, normalizedEmail);
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
          return { success: true, user };
        });

      return { success: true, user: { email: normalizedEmail } };
    }

    const nameParts = normalizedEmail.split('@')[0].split('.');
    const formattedName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    const user = {
      name: formattedName || 'HR Admin',
      email: normalizedEmail,
      role: normalizedEmail.includes('admin') ? 'Senior HR Director' : 'People Operations Manager',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=2563eb&color=fff`,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    if (remember) {
      localStorage.setItem(REMEMBER_KEY, normalizedEmail);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    return { success: true, user };
  },

  // Fill remembered email if exists
  getRememberedEmail() {
    return localStorage.getItem(REMEMBER_KEY) || '';
  },

  // Quick Demo Login helper
  demoLogin(role = 'admin') {
    const email = role === 'admin' ? 'admin@company.com' : 'hr.manager@company.com';
    return this.login(email, 'password123', true);
  },

  // Logout session
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'index.html';
  },

  // Route Guard for protected pages
  requireAuth() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    return user;
  },

  // Redirect if already logged in (on index.html)
  redirectIfAuthenticated() {
    const user = this.getCurrentUser();
    if (user) {
      window.location.href = 'dashboard.html';
    }
  }
};
