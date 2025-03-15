const Login = {
  template: `
    <div>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-end">
            <button type="button" class="btn-close" aria-label="Close" @click="close"></button>
          </div>
          <h2 class="card-title">Login</h2>
          <form @submit.prevent="login">
            <!-- Email Field -->
            <div class="mb-3">
              <label for="email" class="form-label">Email:</label>
              <input type="email" class="form-control" id="email" v-model="email" placeholder="Enter your email" required>
              <div v-if="emailError" class="alert alert-warning mt-2">
                {{ emailError }}
              </div>
            </div>

            <!-- Password Field -->
            <div class="mb-3">
              <label for="password" class="form-label">Password:</label>
              <input type="password" class="form-control" id="password" v-model="password" placeholder="Enter your password" required>
            </div>

            <!-- Login Button -->
            <button type="submit" class="btn btn-primary">Login</button>
          </form>

          <!-- Display error message if login fails -->
          <div v-if="message" class="alert alert-danger mt-3">
            {{ message }}
          </div>

          <!-- Link to Register Page -->
          <div class="mt-3 text-center">
            New User? <router-link to="/register">Register</router-link>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      emailError: '',
      message: '',
    };
  },
  methods: {
    close() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.emailError = 'Invalid email format';
        return false;
      }
      return true;
    },
    async login() {
      // Add this temporary debug
    console.log("Attempting login with:", {email: this.email.trim().toLowerCase(),password: this.password});

      if (!this.validateEmail()) return;
      // Reset previous messages
      this.message = '';
      this.emailError = '';

      try {
        // Trim and lowercase email
        const cleanEmail = this.email.toLowerCase().trim();
        
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: this.password
          }),
        });

        // Handle non-JSON responses
        if (!response.ok && response.status !== 400) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Add response debug
        console.log("Raw response:", response);
        const textResponse = await response.clone().text();
        console.log("Raw response text:", textResponse);
        

        const data = await response.json();

        if (response.ok) {
          // Validate token structure
          if (!data['auth-token'] || typeof data['auth-token'] !== 'string') {
            throw new Error('Invalid authentication token received');
          }

          // Store authentication data
          localStorage.setItem('auth-token', data['auth-token']);
          localStorage.setItem('user-info', JSON.stringify({
            id: data.id,
            email: data.email,
            roles: data.roles
          }));

          // Redirect logic
          const targetRoute = data.roles.includes('admin') ? '/admin' : '/user_dashboard';
          this.$router.push(targetRoute);
        } else {
          this.message = data.message || 'Authentication failed. Please check credentials.';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.message = error.message || 'Connection error. Please try again.';
      }
    },
  },
};

Login.style = `
  <style scoped>
    .card {
      max-width: 500px;
      margin: 50px auto;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .card-title {
      text-align: center;
      margin-bottom: 20px;
    }

    .form-label {
      font-weight: bold;
    }

    .btn-primary {
      width: 100%;
      margin-top: 10px;
    }

    .alert {
      margin-top: 10px;
    }

    .mt-3 {
      margin-top: 1rem;
    }

    .text-center {
      text-align: center;
    }
  </style>
`;

export default Login;
