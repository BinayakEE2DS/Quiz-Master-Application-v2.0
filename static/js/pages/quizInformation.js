const QuizInformation = {
    template: `
      <div>
        <!-- Quiz Information Form -->
        <div id="quiz-info-container">
          <h4 style="color: blue; text-align: center">Quiz Information</h4><br>
          <div class="form-horizontal">
            <!-- Quiz ID -->
            <div class="mb-3">
              <label for="quizId" class="form-label">ID:</label>
              <input type="number" class="form-control" id="quizId" :value="quizInfo.quiz_id" readonly>
            </div>
            <!-- Subject Name -->
            <div class="mb-3">
              <label for="subjectName" class="form-label">Subject:</label>
              <input type="text" class="form-control" id="subjectName" :value="quizInfo.subject_name" readonly>
            </div>
            <!-- Chapter Name -->
            <div class="mb-3">
              <label for="chapterName" class="form-label">Chapter:</label>
              <input type="text" class="form-control" id="chapterName" :value="quizInfo.chapter_name" readonly>
            </div>
            <!-- Number of Questions -->
            <div class="mb-3">
              <label for="noOfQuestions" class="form-label">Number of Questions:</label>
              <input type="text" class="form-control" id="noOfQuestions" :value="quizInfo.no_of_questions" readonly>
            </div>
            <!-- Time Duration -->
            <div class="mb-3">
              <label for="timeDuration" class="form-label">Time Duration:</label>
              <input type="time" class="form-control" id="timeDuration" :value="quizInfo.time_duration" readonly>
            </div>
            <!-- Scheduled Date -->
            <div class="mb-3">
              <label for="scheduledDate" class="form-label">Scheduled Date:</label>
              <input type="date" class="form-control" id="scheduledDate" :value="quizInfo.scheduled_date" readonly>
            </div>
          </div>
          <!-- Close Button -->
          <div class="buttons" style="text-align: center">
            <br>
            <router-link to="/admin_quiz_management" class="btn btn-danger">Close</router-link>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        quizInfo: {
          quiz_id: '',
          subject_name: '',
          chapter_name: '',
          no_of_questions: '',
          time_duration: '',
          scheduled_date: ''
        }
      };
    },
    methods: {
      // Fetch quiz information from the backend
      async fetchQuizInfo(quizId) {
        try {
          const response = await fetch(`/quiz_information/${quizId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.quizInfo = {
              quiz_id: data.quiz_id,
              subject_name: data.subject_name,
              chapter_name: data.chapter_name,
              no_of_questions: data.no_of_questions,
              time_duration: data.time_duration,
              scheduled_date: data.scheduled_date
            };
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching quiz information:', error);
        }
      }
    },
    mounted() {
      const quizId = this.$route.params.quizId;
      this.fetchQuizInfo(quizId);
    }
  };
  
  // Add scoped styles
  QuizInformation.style = `
    <style scoped>
      #quiz-info-container {
        border: 2px solid black;
        width: 500px;
        height: 560px;
        margin: auto;
        margin-top: 50px;
        padding: 20px;
        border-radius: 5px;
        background-color: white;
      }
  
      .form-horizontal .form-label {
        text-align: center;
        flex: 0 0 150px;
        max-width: 150px;
        margin-bottom: 0;
      }
  
      .form-horizontal .form-control {
        flex: 1;
      }
  
      .form-horizontal .mb-3 {
        display: flex;
        align-items: center;
      }
  
      .buttons {
        margin-bottom: 10px;
        margin-top: 20px;
      }
    </style>
  `;
  
  export default QuizInformation;