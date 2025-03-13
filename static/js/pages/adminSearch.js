const AdminSearch = {
    template: `
        <div>
            <!-- Navbar -->
            <nav class="navbar navbar-expand-lg" style="background-color: rgb(255, 157, 0); border: 1px solid black">
                <div class="container-fluid">
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <router-link class="nav-link active" aria-current="page" to="/admin">Home</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link active" aria-current="page" to="/quiz_management">Quiz</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link class="nav-link active" aria-current="page" to="/admin_summary_charts">Summary</router-link>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" aria-current="page" href="#" @click="logout">Logout</a>
                            </li>
                        </ul>
                        <form class="d-flex" role="search" @submit.prevent="search">
                            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" v-model="searchQuery">
                            <button class="btn btn-outline-success" type="submit">Search</button>
                        </form>
                        <a class="navbar-brand ms-auto" href="#">Welcome Admin</a>
                    </div>
                </div>
            </nav>

            <!-- Main Container -->
            <div id="container">
                <!-- Display search results -->
                <h4 v-if="searchResults.length > 0">Search Results for "{{ searchQuery }}"</h4>
                <h4 v-else>No results found for "{{ searchQuery }}"</h4>

                <!-- Table for Search Results -->
                <table class="table" v-if="searchResults.length > 0">
                    <thead>
                        <tr>
                            <th scope="col">Subject Name</th>
                            <th scope="col">Chapter Name</th>
                            <th scope="col">Quiz ID</th>
                            <th scope="col">No. of Questions</th>
                            <th scope="col">Scheduled Date</th>
                            <th scope="col">Time Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="result in searchResults" :key="result.quiz_id">
                            <td>{{ result.subject_name }}</td>
                            <td>{{ result.chapter_name }}</td>
                            <td>{{ result.quiz_id }}</td>
                            <td>{{ result.no_of_questions }}</td>
                            <td>{{ result.scheduled_date }}</td>
                            <td>{{ result.time_duration }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            searchQuery: '', // Search query entered by the admin
            searchResults: [], // Search results fetched from the backend
        };
    },
    methods: {
        // Fetch search results from the backend
        async fetchSearchResults() {
            try {
                const response = await fetch(`/admin_search?search=${this.searchQuery}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    this.searchResults = data;
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        },
        // Logout the admin
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
        // Get the search query from the URL parameters
        this.searchQuery = this.$route.query.search || '';
        if (this.searchQuery) {
            this.fetchSearchResults(); // Fetch search results if a query is present
        }
    },
};

// Add scoped styles
AdminSearch.style = `
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
    </style>
`;

export default AdminSearch;