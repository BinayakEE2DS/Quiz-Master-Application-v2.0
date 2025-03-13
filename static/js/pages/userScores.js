const UserScores = {
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
          <div class="table_container">
            <h5>Quiz Scores</h5>
            <!-- Quiz Scores Table -->
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Quiz ID</th>
                  <th scope="col">Subject Name</th>
                  <th scope="col">Chapter Name</th>
                  <th scope="col">Number of Questions</th>
                  <th scope="col">Date of Attempt</th>
                  <th scope="col">Status</th>
                  <th scope="col">Your Score</th>
                  <th scope="col">Total Marks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="score in scores" :key="score.quiz_id">
                  <td>{{ score.quiz_id }}</td>
                  <td>{{ score.subject_name }}</td>
                  <td>{{ score.chapter_name }}</td>
                  <td>{{ score.no_of_questions }}</td>
                  <td>{{ score.date_of_attempt || '-' }}</td>
                  <td>{{ score.status || 'N/A' }}</td>
                  <td>{{ score.your_score }}</td>
                  <td>{{ score.total_marks }}</td>
                </tr>
                <tr v-if="scores.length === 0">
                  <td colspan="8" style="text-align: center;">No scores available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        scores: [], // List of user scores
        username: '', // Current user's username
        searchQuery: '', // Search query for user search
      };
    },
    methods: {
      // Fetch user scores from the backend
      async fetchScores() {
        try {
          const response = await fetch('/user_scores', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.scores = data.scores; // Update scores
            this.username = data.username; // Update username
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching scores:', error);
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
      this.fetchScores(); // Fetch scores and username when the component is mounted
    },
  };
  
  // Scoped styles
  UserScores.style = `
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
  
      .table_container h5 {
        text-align: center;
        margin-bottom: 20px;
        font-size: 24px;
        color: #333;
      }
  
      .table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        border: 1px solid black;
      }
  
      .table thead tr th {
        background-color: #424949;
        color: white;
        font-size: 16px;
        padding: 12px;
        text-align: center;
        border: 1px solid black;
      }
  
      .table tbody tr td {
        font-size: 14px;
        padding: 10px;
        text-align: center;
        border: 1px solid black;
      }
  
      .table tbody tr:nth-child(even) {
        background-color: #f9f9f9;
      }
  
      .table tbody tr:hover {
        background-color: #f1f1f1;
      }
    </style>
  `;
  
  export default UserScores;