const AdminSummaryCharts = {
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
                <!-- Display the generated chart -->
                <div class="chart-container">
                    <img :src="chartPath" alt="Summary Chart" class="img-fluid">
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            chartPath: '', // Path to the generated chart image
            searchQuery: '', // Search query for admin search
        };
    },
    methods: {
        // Fetch the chart path from the backend
        async fetchChart() {
            try {
                const response = await fetch('/admin_summary_charts', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    this.chartPath = data.chart_path;
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching chart:', error);
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
            this.$router.push(`/admin_search?search=${this.searchQuery}`);
        },
    },
    mounted() {
        this.fetchChart(); // Fetch the chart when the component is mounted
    },
};

// Add scoped styles
AdminSummaryCharts.style = `
    <style scoped>
        #container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            background-color: white;
            border: 1px solid black;
            border-radius: 0px;
            margin: 20px auto;
            max-width: 1200px;
        }

        .chart-container {
            text-align: center;
            margin-top: 20px;
        }

        .img-fluid {
            max-width: 100%;
            height: auto;
        }
    </style>
`;

export default AdminSummaryCharts;