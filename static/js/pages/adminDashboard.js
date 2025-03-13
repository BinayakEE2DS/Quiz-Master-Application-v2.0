const AdminDashboard = {
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
          <!-- Display message if no subjects are available -->
          <h4 v-if="subjects.length === 0">There are no subjects to display</h4>
  
          <!-- Subject Containers -->
          <div v-for="subject in subjects" :key="subject.id" class="subject_container">
            <h5>{{ subject.name }}</h5>
  
            <!-- Table for Chapters -->
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Chapter Name</th>
                  <th scope="col">Number of Quizzes</th>
                  <th scope="col">Number of Questions</th>
                  <th scope="col" colspan="2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="chapter in chapters" :key="chapter.id" v-if="chapter.subject_id === subject.id">
                  <td>{{ chapter.name }}</td>
                  <td>{{ getQuizCount(chapter.id) }}</td>
                  <td>{{ getQuestionCount(chapter.id) }}</td>
                  <td>
                    <router-link :to="'/edit_chapter/' + chapter.id" class="btn btn-primary">Edit</router-link>
                  </td>
                  <td>
                    <button class="btn btn-danger" @click="deleteChapter(chapter.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
  
            <!-- Add Chapter and Delete Subject Buttons -->
            <div class="chapter_button">
              <router-link :to="'/create_new_chapter/' + subject.id" class="btn btn-primary">Add Chapter</router-link>
              <button class="btn btn-danger" @click="deleteSubject(subject.id)">Delete Subject</button>
            </div>
          </div>
  
          <!-- Add Subject Button -->
          <div class="subject_button">
            <router-link to="/create_new_subject" class="btn btn-success">Add Subject</router-link>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        subjects: [], // List of subjects
        chapters: [], // List of chapters
        quizzes: [], // List of quizzes
        searchQuery: '', // Search query for admin search
      };
    },
    methods: {
      // Fetch data from the backend
      async fetchData() {
        try {
          const response = await fetch('/admin', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.subjects = data.subjects;
            this.chapters = data.chapters;
            this.quizzes = data.quizzes;
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
      // Get the number of quizzes for a chapter
      getQuizCount(chapterId) {
        return this.quizzes.filter((quiz) => quiz.chapter_id === chapterId).length;
      },
      // Get the number of questions for a chapter
      getQuestionCount(chapterId) {
        return this.quizzes
          .filter((quiz) => quiz.chapter_id === chapterId)
          .reduce((sum, quiz) => sum + quiz.no_of_questions, 0);
      },
      // Delete a chapter
      async deleteChapter(chapterId) {
        if (confirm('Are you sure you want to delete this chapter and all its related data?')) {
          try {
            const response = await fetch(`/delete_chapter/${chapterId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
              },
            });
            if (response.ok) {
              alert('Chapter deleted successfully');
              this.fetchData(); // Refresh data
            } else {
              const data = await response.json();
              alert(data.message || 'Failed to delete chapter');
            }
          } catch (error) {
            console.error('Error deleting chapter:', error);
          }
        }
      },
      // Delete a subject
      async deleteSubject(subjectId) {
        if (confirm('Are you sure you want to delete this subject and all its related data?')) {
          try {
            const response = await fetch(`/delete_subject/${subjectId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
              },
            });
            if (response.ok) {
              alert('Subject deleted successfully');
              this.fetchData(); // Refresh data
            } else {
              const data = await response.json();
              alert(data.message || 'Failed to delete subject');
            }
          } catch (error) {
            console.error('Error deleting subject:', error);
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
  AdminDashboard.style = `
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
  
      .subject_container {
        border: 1px solid black;
        padding: 20px;
        border-radius: 10px;
        background-color: white;
      }
  
      .subject_container h5 {
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
  
      .chapter_button {
        text-align: right;
        margin-top: 10px;
      }
  
      .subject_button {
        text-align: center;
        margin-top: 20px;
      }
  
      .btn {
        margin: 5px;
      }
    </style>
  `;
  
  export default AdminDashboard;