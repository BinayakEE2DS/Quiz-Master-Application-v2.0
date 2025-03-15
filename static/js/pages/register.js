const Register = {
    template: `
<div>
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <button type="button" class="btn-close" aria-label="Close" @click="close"></button>
            </div>
            <h2 class="card-title">Register</h2>
            <form @submit.prevent="register">
              <!-- Username Field -->
              <div class="mb-3">
                <label for="username" class="form-label">Username:</label>
                <input type="text" class="form-control" id="username" v-model="username" placeholder="Enter your username" required>
              </div>
  
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
  
              <!-- Fullname Field -->
              <div class="mb-3">
                <label for="fullname" class="form-label">Fullname:</label>
                <input type="text" class="form-control" id="fullname" v-model="fullname" placeholder="Enter your full name" required>
              </div>
  
              <!-- Qualification Field -->
              <div class="mb-3">
                <label for="qualification" class="form-label">Qualification:</label>
                <input type="text" class="form-control" id="qualification" v-model="qualification" placeholder="Enter your qualification" required>
              </div>
  
              <!-- Date of Birth Field -->
              <div class="mb-3">
                <label for="date_of_birth" class="form-label">Date of Birth:</label>
                <input type="date" class="form-control" id="date_of_birth" v-model="date_of_birth" required>
              </div>
  
              <!-- Register Button -->
              <button type="submit" class="btn btn-primary">Register</button>
            </form>
  
            <!-- Display error message if registration fails -->
            <div v-if="message" class="alert alert-danger mt-3">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        username: '',
        email: '',
        password: '',
        fullname: '',
        qualification: '',
        date_of_birth: '',
        emailError: '',
        message: '',
      };
    },
    methods: {
      validateEmail() {
        const emailRegex = /^[^\s@]+@user\.com$/;
        if (!emailRegex.test(this.email)) {
          this.emailError = 'Email must have the domain "@user.com".';
          return false;
        }
        this.emailError = '';
        return true;
      },
      close() {
        if (this.$route.path !== '/') {
          this.$router.push('/');
        }
      },
      async register() {
        if (!this.validateEmail()) return;
        
        if (!this.username || !this.email || !this.password || !this.fullname || !this.qualification || !this.date_of_birth) {
          this.message = 'All fields are required!';
          return;
        }

        try {
          const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: this.username,
              email: this.email,
              password: this.password,
              fullname: this.fullname,
              qualification: this.qualification,
              date_of_birth: this.date_of_birth,
            }),
          });

          // Handle non-JSON responses
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Server error: ${text.substring(0, 100)}`);
          }

          const data = await response.json();
          
          if (response.ok) {
            alert(data.message);
            this.$router.push('/login');
          } else {
            this.message = data.message || 'Registration failed. Please try again.';
          }
        } catch (error) {
          console.error('Registration error:', error);
          this.message = error.message || 'An error occurred during registration. Please try again.';
        }
      },
    },
  };
  
  // Add scoped styles
  Register.style = `
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
    </style>
  `;
  
  export default Register;
