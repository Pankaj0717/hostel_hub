import { authService } from './js/auth.js';
import { showMessage, updateUIForUser } from './js/ui.js';
import { initializeDashboard } from './js/dashboard.js';

// DOM Elements
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');
const modal = document.getElementById('authModal');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchFormBtns = document.querySelectorAll('.switch-form');
const userTypeToggles = document.querySelectorAll('.user-type-toggle button');
const ownerFields = document.querySelector('.owner-fields');

// Show/Hide Modal
function toggleModal(show = true) {
  modal.style.display = show ? 'flex' : 'none';
}

// Switch between login and register forms
function switchForm(formType) {
  if (formType === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }
}

// Toggle user type (student/owner)
function toggleUserType(button) {
  const type = button.dataset.type;
  const toggleGroup = button.parentElement;
  
  toggleGroup.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  // Show/hide owner-specific fields in registration
  if (registerForm.contains(button)) {
    ownerFields.classList.toggle('hidden', type !== 'owner');
  }
}

// Handle Registration
async function handleRegister(e) {
  e.preventDefault();
  
  const formData = new FormData(registerForm);
  const userType = registerForm.querySelector('.user-type-toggle .active').dataset.type;
  
  const userData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    userType
  };

  // Add hostel owner specific fields
  if (userType === 'owner') {
    userData.hostelName = formData.get('hostelName');
    userData.contactNumber = formData.get('contactNumber');
  }

  // Validate passwords match
  if (userData.password !== userData.confirmPassword) {
    showMessage('Passwords do not match');
    return;
  }

  try {
    const user = authService.register(userData);
    showMessage('Registration successful!', 'success');
    updateUIForUser(user);
    toggleModal(false);
    initializeDashboard();
  } catch (error) {
    showMessage(error.message);
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  
  const formData = new FormData(loginForm);
  const userType = loginForm.querySelector('.user-type-toggle .active').dataset.type;
  
  try {
    const user = authService.login(
      formData.get('email'),
      formData.get('password'),
      userType
    );
    showMessage('Login successful!', 'success');
    updateUIForUser(user);
    toggleModal(false);
    initializeDashboard();
  } catch (error) {
    showMessage(error.message);
  }
}

// Handle Logout
function handleLogout() {
  authService.logout();
  location.reload();
}

// Event Listeners
loginBtn?.addEventListener('click', () => {
  switchForm('login');
  toggleModal(true);
});

registerBtn?.addEventListener('click', () => {
  switchForm('register');
  toggleModal(true);
});

closeBtn.addEventListener('click', () => toggleModal(false));

modal.addEventListener('click', (e) => {
  if (e.target === modal) toggleModal(false);
});

switchFormBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm(btn.dataset.form);
  });
});

userTypeToggles.forEach(btn => {
  btn.addEventListener('click', () => toggleUserType(btn));
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

document.body.addEventListener('click', (e) => {
  if (e.target.matches('.logout-btn')) {
    handleLogout();
  }
});

// Check for logged-in user on page load
const currentUser = authService.getCurrentUser();
if (currentUser) {
  updateUIForUser(currentUser);
  initializeDashboard();
}