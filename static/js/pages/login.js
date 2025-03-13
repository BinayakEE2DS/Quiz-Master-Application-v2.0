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
      async login() {
        // Validate email and password
        if (!this.email || !this.password) {
          this.message = 'Email and password are required!';
          return;
        }
  
        try {
          const response = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            // Login successful
            localStorage.setItem('auth-token', data['auth-token']); // Store the token
            localStorage.setItem('roles', JSON.stringify(data.roles)); // Store the roles
  
            // Redirect based on role
            if (data.roles.includes('admin')) {
              this.$router.push('/admin');
            } else if (data.roles.includes('user')) {
              this.$router.push('/user_dashboard');
            }
          } else {
            // Login failed
            this.message = data.message || 'Login failed. Please try again.';
          }
        } catch (error) {
          console.error('Error during login:', error);
          this.message = 'An error occurred during login. Please try again.';
        }
      },
    },
  };
  
  // Add scoped styles
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