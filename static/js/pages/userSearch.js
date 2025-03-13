const UserSearch = {
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
          <h4 v-if="searchQuery">Search Results for "{{ searchQuery }}"</h4>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Subject Name</th>
                <th scope="col">Chapter Name</th>
                <th scope="col">Quiz ID</th>
                <th scope="col">No. of Questions</th>
                <th scope="col">Scheduled Date</th>
                <th scope="col">Time Duration</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in searchResults" :key="result.quiz_id">
                <td>{{ result.subject_name }}</td>
                <td>{{ result.chapter_name }}</td>
                <td>{{ result.quiz_id }}</td>
                <td>{{ result.no_of_questions }}</td>
                <td>{{ formatDate(result.scheduled_date) }}</td>
                <td>{{ result.time_duration }}</td>
                <td>{{ result.status }}</td>
              </tr>
              <tr v-if="searchResults.length === 0">
                <td colspan="7" style="text-align: center;">No results found for "{{ searchQuery }}"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    data() {
      return {
        username: '', // Username of the logged-in user
        searchQuery: '', // Search query entered by the user
        searchResults: [], // Results fetched from the backend
      };
    },
    methods: {
      // Fetch search results from the backend
      async fetchSearchResults() {
        try {
          const response = await fetch(`/user_search?search=${this.searchQuery}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.searchResults = data; // Set the search results
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      },
      // Format date as DD-MM-YYYY
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
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
        this.fetchSearchResults(); // Fetch search results when the search button is clicked
      },
    },
    mounted() {
      // Fetch the username of the logged-in user
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        this.username = user.username;
      }
  
      // Fetch search results if a search query is present in the URL
      const query = this.$route.query.search;
      if (query) {
        this.searchQuery = query;
        this.fetchSearchResults();
      }
    },
  };
  
  // Add scoped styles
  UserSearch.style = `
    <style scoped>
      #container {
        border: 1px solid black;
        padding: 20px;
        margin: 20px auto;
        max-width: 1000px;
        background-color: whitesmoke;
      }
  
      .table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 15px;
      }
  
      .table thead tr th {
        text-align: center;
        background: #424949;
        color: white;
        padding: 0.8rem;
        border: 1px solid black;
      }
  
      .table tbody tr td {
        text-align: center;
        padding: 0.8rem;
        border: 1px solid black;
      }
  
      .btn {
        margin: 5px;
      }
    </style>
  `;
  
  export default UserSearch;