const UserDashboard = {
    template: `
      <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg" style="background-color: rgb(255, 157, 0); border: 1px solid black">
          <div class="container-fluid">
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <router-link class="nav-link active" aria-current="page" to="/user">Home</router-link>
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
            <h5>Upcoming Quizzes</h5>
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">No. of Questions</th>
                  <th scope="col">Date</th>
                  <th scope="col">Duration</th>
                  <th scope="col" colspan="2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="quiz in quizzes" :key="quiz.id">
                  <td>{{ quiz.id }}</td>
                  <td>{{ quiz.no_of_questions }}</td>
                  <td>{{ formatDate(quiz.date_of_quiz) }}</td>
                  <td>{{ formatTime(quiz.time_duration) }}</td>
                  <td>
                    <router-link :to="'/user_quiz_information/' + quiz.id" class="btn btn-primary">View</router-link>
                  </td>
                  <td>
                    <router-link :to="'/start_quiz/' + quiz.id + '/' + quiz.first_question_id" class="btn btn-success">Start</router-link>
                  </td>
                </tr>
                <tr v-if="quizzes.length === 0">
                  <td colspan="5" style="text-align: center;">No upcoming quizzes available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        username: '', // Username of the logged-in user
        quizzes: [], // List of upcoming quizzes
        searchQuery: '', // Search query for user search
      };
    },
    methods: {
      // Fetch user data and quizzes from the backend
      async fetchData() {
        try {
          // Fetch user details
          const userResponse = await fetch('/user', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const userData = await userResponse.json();
          if (userResponse.ok) {
            this.username = userData.username;
          } else {
            console.error(userData.message);
          }
  
          // Fetch upcoming quizzes
          const quizResponse = await fetch('/user_quizzes', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const quizData = await quizResponse.json();
          if (quizResponse.ok) {
            this.quizzes = quizData.quizzes;
          } else {
            console.error(quizData.message);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
      // Format date as DD-MM-YYYY
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
      },
      // Format time as HH:MM:SS
      formatTime(timeString) {
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS format
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
      this.fetchData(); // Fetch data when the component is mounted
    },
  };
  
  // Add scoped styles
  UserDashboard.style = `
    <style scoped>
      #container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 300px;
        min-width: 600px;
        max-width: 650px;
        background-color: whitesmoke;
        margin-left: 300px;
        margin-right: 300px;
        margin-top: 40px;
        margin-bottom: 200px;
        border: 1px solid black; /* Black border for the container */
        text-align: center;
        justify-content: center;
      }
  
      .table_container h5 {
        border: #424949;
        text-align: center;
        margin: 10px 10px;
      }
  
      /* Table Styles */
      .table {
        border-collapse: collapse;
        width: 100%;
      }
  
      .table thead tr th {
        text-align: center;
        height: 100%;
        background: #424949;
        color: white;
        font-size: medium;
        padding: 0.8rem;
        vertical-align: top;
        border: 1px solid black; /* Black field separator for headers */
      }
  
      .table tbody tr td {
        font-size: medium;
        text-align: center;
        padding: auto;
        border: 1px solid black; /* Black field separator for body cells */
      }
  
      .btn {
        margin: 5px;
      } 
    </style>
  `;
  
  export default UserDashboard;