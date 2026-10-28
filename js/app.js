/**
 * Global App Controller
 * Theme Manager, Sidebar Navigation, UI Utilities, Global Search & Toast Notifications
 */

const App = {
  init() {
    this.initTheme();
    this.initSidebar();
    this.initUserSession();
    this.highlightActiveNav();
    this.initGlobalEvents();
    this.initGlobalSearch();
    this.initBackendStatus();
  },

  initBackendStatus() {
    const target = document.querySelector('.navbar-right');
    if (!target) return;

    let badge = document.getElementById('backendStatusBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'backendStatusBadge';
      badge.className = 'badge rounded-pill px-3 py-2 fw-semibold';
      badge.style.fontSize = '0.72rem';
      badge.style.border = '1px solid rgba(148, 163, 184, 0.35)';
      target.insertBefore(badge, target.firstChild);
    }

    this.updateBackendStatus('checking', 'Checking API…');
    this.checkBackendStatus();
  },

  updateBackendStatus(state, label) {
    const badge = document.getElementById('backendStatusBadge');
    if (!badge) return;

    const isOnline = state === 'online';
    const isChecking = state === 'checking';
    badge.textContent = label;
    badge.className = `badge rounded-pill px-3 py-2 fw-semibold ${isOnline ? 'bg-success-subtle text-success border border-success-subtle' : isChecking ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'}`;
  },

  async checkBackendStatus() {
    const apiBase = (typeof window !== 'undefined' && window.API_BASE_URL) || 'http://localhost:3000/api';

    try {
      const response = await fetch(`${apiBase}/health`, { cache: 'no-store' });
      if (response.ok) {
        this.updateBackendStatus('online', 'Backend online');
      } else {
        this.updateBackendStatus('offline', 'Local fallback');
      }
    } catch (error) {
      this.updateBackendStatus('offline', 'Local fallback');
    }
  },

  // Initialize Light / Dark theme from LocalStorage
  initTheme() {
    const savedTheme = localStorage.getItem('ems_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ems_theme', newTheme);
        this.updateThemeIcon(newTheme);

        // Notify charts if available on page
        if (window.Dashboard && typeof window.Dashboard.renderCharts === 'function') {
          window.Dashboard.renderCharts();
        }
        if (window.ReportsModule && typeof window.ReportsModule.renderReportsCharts === 'function') {
          window.ReportsModule.renderReportsCharts();
        }
      });
    }
  },

  updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggleBtn i');
    if (icon) {
      icon.className = theme === 'dark' ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill';
    }
  },

  // Toggle responsive sidebar for mobile devices
  initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        if (overlay) overlay.classList.toggle('show');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
      });
    }
  },

  // Populate user session details in sidebar & navbar
  initUserSession() {
    const user = Auth.getCurrentUser();
    if (user) {
      const nameElems = document.querySelectorAll('.session-user-name');
      const roleElems = document.querySelectorAll('.session-user-role');
      const avatarElems = document.querySelectorAll('.session-user-avatar');

      nameElems.forEach(el => el.textContent = user.name || 'Admin User');
      roleElems.forEach(el => el.textContent = user.role || 'Senior HR Director');
      avatarElems.forEach(el => {
        if (el.tagName === 'IMG') {
          el.src = user.avatar;
        }
      });
    }
  },

  // Highlight current page in sidebar
  highlightActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.sidebar-link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // Attach global logout & dataset reset events
  initGlobalEvents() {
    const logoutBtns = document.querySelectorAll('.btn-logout');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    });

    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all system data back to the default sample dataset?')) {
          DataStore.resetAllSampleData();
          this.showToast('System database reset to sample dataset!', 'info');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    }
  },

  // Search everywhere top bar listener
  initGlobalSearch() {
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
      globalSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && globalSearchInput.value.trim() !== '') {
          const query = encodeURIComponent(globalSearchInput.value.trim());
          const currentPage = window.location.pathname.split('/').pop();
          if (currentPage !== 'employees.html') {
            window.location.href = `employees.html?search=${query}`;
          }
        }
      });
    }
  },

  // Floating Toast Alert notification system
  showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'danger' ? 'bg-danger text-white' :
                    type === 'warning' ? 'bg-warning text-dark' :
                    type === 'info' ? 'bg-info text-white' : 'bg-success text-white';

    const iconClass = type === 'danger' ? 'bi-exclamation-triangle-fill' :
                      type === 'warning' ? 'bi-exclamation-circle-fill' :
                      type === 'info' ? 'bi-info-circle-fill' : 'bi-check-circle-fill';

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 show shadow-lg mb-2" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${iconClass} fs-5"></i>
            <span class="fw-semibold">${message}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElem = document.getElementById(toastId);

    setTimeout(() => {
      if (toastElem) {
        toastElem.classList.remove('show');
        setTimeout(() => toastElem.remove(), 300);
      }
    }, 4000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
