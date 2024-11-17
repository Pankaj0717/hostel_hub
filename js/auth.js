// User management and authentication
class AuthService {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
  }

  register(userData) {
    // Check if email already exists
    if (this.users.some(user => user.email === userData.email)) {
      throw new Error('Email already registered');
    }

    // Add user to storage
    const user = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    return user;
  }

  login(email, password, userType) {
    const user = this.users.find(u => 
      u.email === email && 
      u.password === password && 
      u.userType === userType
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Store current user
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
}

export const authService = new AuthService();