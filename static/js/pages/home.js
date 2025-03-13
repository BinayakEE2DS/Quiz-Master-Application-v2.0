const Home = {
    template: `
      <div class="home-container">
        <!-- Application Name -->
        <h1 class="app-name">Prasnottari Quiz Master Application – version 2.0</h1>
        
        <!-- Tagline -->
        <p class="tagline">Practise to perfection</p>
        
        <!-- Buttons -->
        <div class="button-container">
          <router-link to="/login" class="btn btn-primary">Login Page</router-link>
          <router-link to="/register" class="btn btn-secondary">Register Page</router-link>
        </div>
      </div>
    `,
  };
  
  // Scoped styles
  Home.style = `
    <style scoped>
      .home-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: black;
        color: white;
        text-align: center;
      }
  
      .app-name {
        font-size: 2.5rem;
        margin-bottom: 20px;
      }
  
      .tagline {
        font-size: 1.5rem;
        margin-bottom: 40px;
      }
  
      .button-container {
        display: flex;
        gap: 20px;
      }
  
      .btn {
        padding: 10px 20px;
        font-size: 1rem;
        border-radius: 5px;
        text-decoration: none;
        color: white;
        transition: background-color 0.3s ease;
      }
  
      .btn-primary {
        background-color: #007bff;
        border: 1px solid #007bff;
      }
  
      .btn-primary:hover {
        background-color: #0056b3;
        border-color: #0056b3;
      }
  
      .btn-secondary {
        background-color: #6c757d;
        border: 1px solid #6c757d;
      }
  
      .btn-secondary:hover {
        background-color: #5a6268;
        border-color: #545b62;
      }
    </style>
  `;
  
  export default Home;