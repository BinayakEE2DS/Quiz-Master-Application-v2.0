const AdminQuizManagement = {
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
                <!-- Display message if no quizzes are available -->
                <h4 v-if="quizzes.length === 0">There are no quizzes to display</h4>

                <!-- Quiz Containers -->
                <div v-for="quiz in quizzes" :key="quiz.id" class="quiz_container">
                    <h5>Quiz {{ quiz.id }} ({{ getChapterName(quiz.chapter_id) }})</h5>

                    <!-- Table for Questions -->
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Question ID</th>
                                <th scope="col">Question Topic</th>
                                <th scope="col" colspan="2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="question in questions" :key="question.id" v-if="question.quiz_id === quiz.id">
                                <td>{{ question.id }}</td>
                                <td>{{ question.question_topic }}</td>
                                <td>
                                    <router-link :to="'/edit_question/' + question.id" class="btn btn-primary">Edit</router-link>
                                </td>
                                <td>
                                    <button class="btn btn-danger" @click="deleteQuestion(question.id)">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Quiz Details, Add Question, and Delete Quiz Buttons -->
                    <div class="quiz_buttons">
                        <router-link :to="'/quiz_information/' + quiz.id" class="btn btn-info">Quiz Details</router-link>
                        <router-link :to="'/create_new_question/' + quiz.id" class="btn btn-primary">Add Question</router-link>
                        <button class="btn btn-danger" @click="deleteQuiz(quiz.id)">Delete Quiz</button>
                    </div>
                </div>

                <!-- Add New Quiz Button -->
                <div class="add_quiz_button">
                    <router-link to="/create_new_quiz" class="btn btn-success">Add New Quiz</router-link>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            quizzes: [], // List of quizzes
            chapters: [], // List of chapters
            questions: [], // List of questions
            searchQuery: '', // Search query for admin search
        };
    },
    methods: {
        // Fetch data from the backend
        async fetchData() {
            try {
                const response = await fetch('/quiz_management', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    this.quizzes = data.quizzes;
                    this.chapters = data.chapters;
                    this.questions = data.questions;
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        // Get the chapter name for a quiz
        getChapterName(chapterId) {
            const chapter = this.chapters.find((c) => c.id === chapterId);
            return chapter ? chapter.name : 'Unknown Chapter';
        },
        // Delete a question
        async deleteQuestion(questionId) {
            if (confirm('Are you sure you want to delete this question?')) {
                try {
                    const response = await fetch(`/delete_question/${questionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                        },
                    });
                    if (response.ok) {
                        alert('Question deleted successfully');
                        this.fetchData(); // Refresh data
                    } else {
                        const data = await response.json();
                        alert(data.message || 'Failed to delete question');
                    }
                } catch (error) {
                    console.error('Error deleting question:', error);
                }
            }
        },
        // Delete a quiz
        async deleteQuiz(quizId) {
            if (confirm('Are you sure you want to delete this quiz and all its related data?')) {
                try {
                    const response = await fetch(`/delete_quiz/${quizId}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                        },
                    });
                    if (response.ok) {
                        alert('Quiz deleted successfully');
                        this.fetchData(); // Refresh data
                    } else {
                        const data = await response.json();
                        alert(data.message || 'Failed to delete quiz');
                    }
                } catch (error) {
                    console.error('Error deleting quiz:', error);
                }
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
        this.fetchData(); // Fetch data when the component is mounted
    },
};

// Add scoped styles
AdminQuizManagement.style = `
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

        .quiz_container {
            border: 1px solid black;
            padding: 20px;
            border-radius: 10px;
            background-color: white;
        }

        .quiz_container h5 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
            font-size: 1.5rem;
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

        .quiz_buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 10px;
        }

        .add_quiz_button {
            text-align: center;
            margin-top: 20px;
        }

        .btn {
            margin: 5px;
        }
    </style>
`;

export default AdminQuizManagement;