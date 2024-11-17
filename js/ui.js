// UI helper functions
export function showMessage(message, type = 'error') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

export function updateUIForUser(user) {
  const navLinks = document.querySelector('.nav-links');
  const userInfo = document.createElement('div');
  userInfo.className = 'user-info';
  userInfo.innerHTML = `
    <span>Welcome, ${user.fullName}</span>
    <button class="logout-btn">Logout</button>
  `;
  
  navLinks.innerHTML = '';
  navLinks.appendChild(userInfo);
}