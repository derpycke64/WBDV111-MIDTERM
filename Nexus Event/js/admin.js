// Admin login + guard for Nexus Events
document.addEventListener('DOMContentLoaded', () => {
  const AUTH_KEY = 'nexusAdminAuth';
  const USER = 'admin';
  const PASS = 'nexus2026';

  const page = document.body.dataset.page;

  // LOGIN PAGE LOGIC
  if (page === 'admin-login' || page === 'admin') {
    if (localStorage.getItem(AUTH_KEY) === 'true') {
      window.location.href = 'admin/index.html';
      return;
    }
    const form = document.querySelector('[data-admin-form]');
    const status = document.querySelector('[data-admin-status]');
    const userInput = document.querySelector('[data-admin-user]');
    const passInput = document.querySelector('[data-admin-pass]');

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const user = userInput ? userInput.value.trim() : '';
        const pass = passInput ? passInput.value.trim() : '';

        if (user === USER && pass === PASS) {
          localStorage.setItem(AUTH_KEY, 'true');
          window.location.href = 'admin/index.html';
        } else {
          if (status) {
            status.textContent = 'Invalid credentials. Access denied.';
            status.style.color = 'var(--pink)'; // Using your theme color
          }
        }
      });
    }
  }

  // DASHBOARD LOGIC
  if (page === 'admin-dashboard') {
    // Security Guard: Kick out if not logged in
    if (localStorage.getItem(AUTH_KEY) !== 'true') {
      window.location.href = '../admin-login.html';
      return;
    }

    // Logout Feature
    const logoutBtn = document.querySelector('[data-admin-logout]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        // Visual feedback
        logoutBtn.textContent = "Logging out...";
        logoutBtn.style.opacity = "0.5";

        // Clear data
        localStorage.removeItem(AUTH_KEY);

        // Delay slightly for smooth transition
        setTimeout(() => {
          window.location.href = '../admin-login.html';
        }, 600);
      });
    }
  }
});