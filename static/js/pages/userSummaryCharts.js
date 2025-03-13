const UserSummaryCharts = {
    template: `
      <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg" style="background-color: rgb(255, 157, 0); border: 1px solid black">
          <div class="container-fluid">
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <router-link class="nav-link active" aria-current="page" to="/user_dashboard">Home</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link active" aria-current="page" to="/user_scores">Scores</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link active" aria-current="page" to="/user_summary_charts">Summary</router-link>
                </li>
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="#" @click="logout">Logout</a>
                </li>
              </ul>
              <form class="d-flex" role="search" @submit.prevent="search">
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" v-model="searchQuery">
                <button class="btn btn-outline-success" type="submit">Search</button>
              </form>
              <a class="navbar-brand ms-auto" href="#">Welcome {{ username }}</a>
            </div>
          </div>
        </nav>
  
        <!-- Main Container -->
        <div id="container">
          <div class="chart_container">
            <h5>User Summary Chart</h5>
            <!-- Display the generated chart -->
            <img v-if="chartPath" :src="chartPath" alt="User Summary Chart" class="img-fluid">
            <p v-else class="text-danger">No chart available. Please try again later.</p>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        chartPath: '', // URL to the chart image
        username: '', // Current user's username
        searchQuery: '', // Search query for user search
        errorMessage: '', // Error message if chart generation fails
      };
    },
    methods: {
      // Fetch the chart path from the backend
      async fetchChartPath() {
        try {
          const response = await fetch('/user_summary_charts', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.chartPath = data.chart_path; // Update chart path
            this.username = data.username; // Update username
          } else {
            this.errorMessage = data.message || 'Failed to fetch chart data';
          }
        } catch (error) {
          this.errorMessage = 'An error occurred while fetching the chart.';
          console.error('Error fetching chart path:', error);
        }
      },
      // Logout the user
      async logout() {
        try {
          // Send a POST request to the backend logout route
          const response = await fetch('/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
  
          // Check if the logout request was successful
          if (response.ok) {
            // Clear local storage
            localStorage.removeItem('auth-token');
            localStorage.removeItem('roles');
            
            // Redirect to the login page
            this.$router.push('/login');
          } else {
            // Handle logout failure
            const data = await response.json();
            alert(data.message || 'Failed to logout');
          }
        } catch (error) {
          console.error('Error logging out:', error);
        }
      },
      // Search functionality
      search() {
        this.$router.push(`/user_search?search=${this.searchQuery}`);
      },
    },
    mounted() {
      this.fetchChartPath(); // Fetch chart path and username when the component is mounted
    },
  };
  
  // Scoped styles
  UserSummaryCharts.style = `
    <style scoped>
      #container {
        width: 90%;
        max-width: 1200px;
        margin: 20px auto;
        padding: 20px;
        background-color: white;
        border: 1px solid black;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
  
      .chart_container h5 {
        text-align: center;
        margin-bottom: 20px;
        font-size: 24px;
        color: #333;
      }
  
      .img-fluid {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
      }
  
      .text-danger {
        color: red;
        text-align: center;
      }
    </style>
  `;
  
  export default UserSummaryCharts;