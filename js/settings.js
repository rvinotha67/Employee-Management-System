/**
 * System Settings Controller
 * Organization Info, Theme, Language, Notifications & Data Reset
 */

const SettingsModule = {
  init() {
    Auth.requireAuth();

    const initPage = () => {
      this.loadSettings();
      this.bindEvents();
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  loadSettings() {
    const settings = DataStore.getSettings();

    const companyInput = document.getElementById('settingCompanyName');
    const emailInput = document.getElementById('settingHrEmail');
    const daysInput = document.getElementById('settingHandoverDays');
    const notifToggle = document.getElementById('settingNotifications');
    const langSelect = document.getElementById('settingLanguage');
    const themeSelect = document.getElementById('settingThemeSelect');

    if (companyInput) companyInput.value = settings.companyName || '';
    if (emailInput) emailInput.value = settings.hrEmail || '';
    if (daysInput) daysInput.value = settings.defaultHandoverDays || 30;
    if (notifToggle) notifToggle.checked = settings.notificationsEnabled !== false;
    if (langSelect) langSelect.value = settings.language || 'English';

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    if (themeSelect) themeSelect.value = currentTheme;
  },

  bindEvents() {
    const form = document.getElementById('settingsForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    const themeSelect = document.getElementById('settingThemeSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ems_theme', newTheme);
        App.updateThemeIcon(newTheme);
      });
    }

    const resetBtn = document.getElementById('settingResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all LocalStorage data back to initial sample dataset?')) {
          DataStore.resetAllSampleData();
          App.showToast('All system data reset to initial dataset!', 'info');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    }
  },

  saveSettings() {
    const companyName = document.getElementById('settingCompanyName').value;
    const hrEmail = document.getElementById('settingHrEmail').value;
    const defaultHandoverDays = parseInt(document.getElementById('settingHandoverDays').value) || 30;
    const notificationsEnabled = document.getElementById('settingNotifications').checked;
    const language = document.getElementById('settingLanguage').value;
    const theme = document.getElementById('settingThemeSelect').value;

    DataStore.saveSettings({
      companyName,
      hrEmail,
      defaultHandoverDays,
      notificationsEnabled,
      language,
      theme
    });

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ems_theme', theme);
    App.updateThemeIcon(theme);

    App.showToast('System settings saved successfully.', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('settings.html')) {
    SettingsModule.init();
  }
});
