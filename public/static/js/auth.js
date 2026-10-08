/**
 * FreshCart - Customer Authentication Logic
 * Handles tab toggling, customer registration, and customer login.
 */

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to home or orders
    const user = getCurrentUser();
    if (user) {
        showToast(`Already logged in as ${user.name}`);
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        return;
    }

    setupAuthTabs();
    setupLoginForm();
    setupRegisterForm();
});

function setupAuthTabs() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form-container');
    const registerForm = document.getElementById('register-form-container');

    if (!tabLogin || !tabRegister) return;

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
}

function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const btn = document.getElementById('btn-login-submit');

        if (!email || !password) {
            showToast('Please enter both email and password.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Logging in...';

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (data.success && data.user) {
                localStorage.setItem('freshcart_user', JSON.stringify(data.user));
                showToast(data.message || 'Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = '/products';
                }, 800);
            } else {
                showToast(data.message || 'Invalid credentials.', 'error');
                btn.disabled = false;
                btn.textContent = 'Log In';
            }
        } catch (err) {
            showToast('Network error during login.', 'error');
            btn.disabled = false;
            btn.textContent = 'Log In';
        }
    });
}

function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const btn = document.getElementById('btn-reg-submit');

        if (!name || !email || !password) {
            showToast('Please fill in all registration fields.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters long.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Creating Account...';

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            if (data.success && data.user) {
                localStorage.setItem('freshcart_user', JSON.stringify(data.user));
                showToast(data.message || 'Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/products';
                }, 800);
            } else {
                showToast(data.message || 'Registration failed.', 'error');
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        } catch (err) {
            showToast('Network error during registration.', 'error');
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}
