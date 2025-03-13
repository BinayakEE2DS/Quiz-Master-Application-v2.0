const CreateNewQuiz = {
    template: `
      <div>
        <!-- Main Container -->
        <div id="canvas">
          <div id="form-body">
            <h4 style="color: blue; text-align: center">New Quiz</h4><br>
            <!-- Form starts here -->
            <form @submit.prevent="submitForm">
              <div class="form-horizontal">
                <!-- Dropdown for Subject Name -->
                <div class="mb-3">
                  <label for="subject_name" class="form-label">Subject Name:</label>
                  <select class="form-control" id="subject_name" v-model="selectedSubjectId" required>
                    <option value="">Select Subject</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
                  </select>
                </div>
                <!-- Dropdown for Chapter Name -->
                <div class="mb-3">
                  <label for="chapter_name" class="form-label">Chapter Name:</label>
                  <select class="form-control" id="chapter_name" v-model="selectedChapterId" required>
                    <option value="">Select Chapter</option>
                    <option v-for="chapter in filteredChapters" :key="chapter.id" :value="chapter.id">{{ chapter.name }}</option>
                  </select>
                </div>
                <!-- Date Input -->
                <div class="mb-3">
                  <label for="date" class="form-label">Date:</label>
                  <input type="date" class="form-control" id="date" v-model="quizDate" required>
                </div>
                <!-- Duration Input -->
                <div class="mb-3">
                  <label for="duration" class="form-label">Time Duration:</label>
                  <input type="time" class="form-control" id="duration" v-model="quizDuration" required>
                </div>
              </div>
              <!-- Buttons -->
              <div class="Buttons" style="text-align: center">
                <br>
                <button type="submit" class="btn btn-success">Save</button>
                <router-link to="/quiz_management" class="btn btn-danger">Cancel</router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        subjects: [], // List of subjects
        chapters: [], // List of chapters
        selectedSubjectId: '', // Selected subject ID
        selectedChapterId: '', // Selected chapter ID
        quizDate: '', // Selected quiz date
        quizDuration: '', // Selected quiz duration
      };
    },
    computed: {
      // Filter chapters based on the selected subject
      filteredChapters() {
        return this.chapters.filter(chapter => chapter.subject_id === this.selectedSubjectId);
      },
    },
    methods: {
      // Fetch subjects and chapters from the backend
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
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
      // Handle form submission
      async submitForm() {
        if (!this.selectedSubjectId || !this.selectedChapterId || !this.quizDate || !this.quizDuration) {
          alert('All fields are required!');
          return;
        }

        const quizData = {
          subject_id: this.selectedSubjectId,
          chapter_id: this.selectedChapterId,
          date: this.quizDate,
          duration: this.quizDuration,
        };

        try {
          const response = await fetch('/create_new_quiz', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify(quizData),
          });
          const data = await response.json();
          if (response.ok) {
            alert('Quiz created successfully!');
            this.$router.push('/quiz_management'); // Redirect to quiz management page
          } else {
            alert(data.message || 'Failed to create quiz');
          }
        } catch (error) {
          console.error('Error creating quiz:', error);
        }
      },
    },
    mounted() {
      this.fetchData(); // Fetch data when the component is mounted
    },
  };

  // Add scoped styles
  CreateNewQuiz.style = `
    <style scoped>
      #canvas {
        border: 2px solid black;
        width: 80%;
        margin: auto;
        height: 650px;
        background-color: black;
      }

      #form-body {
        border: 2px solid black;
        width: 500px;
        height: 550px;
        margin: auto;
        margin-top: 50px;
        padding: 20px;
        border-radius: 5px;
        background-color: white;
      }

      .form-horizontal {
        margin-bottom: 20px;
      }

      .Buttons {
        text-align: center;
      }

      .btn {
        margin: 5px;
      }
    </style>
  `;

  export default CreateNewQuiz;