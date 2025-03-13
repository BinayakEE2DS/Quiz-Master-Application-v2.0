const StartQuiz = {
    template: `
      <div class="start-quiz-container">
        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-item">
            <label for="questionSelect">Select Question No.:</label>
            <select id="questionSelect" v-model="selectedQuestionId" @change="loadQuestion">
              <option v-for="(question, index) in questions" :key="question.id" :value="question.id">
                Question {{ index + 1 }}
              </option>
            </select>
          </div>
          <div class="status-item">
            Current Question No.: <span>{{ currentQuestionIndex + 1 }}</span>
          </div>
          <div class="status-item">
            Total Questions: <span>{{ questions.length }}</span>
          </div>
          <div class="status-item">
            Time Left: <span id="timer">{{ formattedTimeLeft }}</span>
          </div>
        </div>
  
        <!-- Question Container -->
        <div class="question-container">
          <h4 style="color: blue; text-align: left; margin-top: 15px;">
            Question No: <span>{{ currentQuestionIndex + 1 }}</span>
          </h4>
          <div class="form-floating">
            <textarea class="form-control" placeholder="Leave a comment here" readonly>{{ currentQuestion.question_statement }}</textarea>
            <label for="floatingTextarea2">Question Statement</label><br>
          </div>
          <h4 style="color: black; text-align: center;">Choose the correct option</h4><br>
          <form @submit.prevent="saveAnswer">
            <input type="hidden" name="quiz_id" :value="quizId">
            <input type="hidden" name="question_id" :value="currentQuestion.id">
            <div class="form-horizontal">
              <!-- Options for answer -->
              <div class="form-check">
                <input class="form-check-input" type="radio" name="answer" id="option1" value="1" v-model="selectedAnswer">
                <label class="form-check-label" for="option1">Option 1: {{ currentQuestion.option_1 }}</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="answer" id="option2" value="2" v-model="selectedAnswer">
                <label class="form-check-label" for="option2">Option 2: {{ currentQuestion.option_2 }}</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="answer" id="option3" value="3" v-model="selectedAnswer">
                <label class="form-check-label" for="option3">Option 3: {{ currentQuestion.option_3 }}</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="answer" id="option4" value="4" v-model="selectedAnswer">
                <label class="form-check-label" for="option4">Option 4: {{ currentQuestion.option_4 }}</label>
              </div>
            </div>
            <!-- Buttons -->
            <div class="buttons">
              <br>
              <button type="submit" class="btn btn-success" name="action" value="save_and_next">Save & Next</button>
              <button type="button" class="btn btn-danger" @click="submitQuiz">Submit</button>
            </div>
          </form>
        </div>
      </div>
    `,
    data() {
      return {
        quizId: null,
        questions: [], // List of questions for the quiz
        currentQuestionIndex: 0, // Index of the current question
        selectedQuestionId: null, // Selected question ID from the dropdown
        selectedAnswer: null, // Selected answer by the user
        timeLeft: 0, // Time left in seconds
        timerInterval: null, // Interval for the timer
        quizInfo: null, // Quiz information from the backend
      };
    },
    computed: {
      // Current question being displayed
      currentQuestion() {
        return this.questions[this.currentQuestionIndex];
      },
      // Formatted time left (MM:SS)
      formattedTimeLeft() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    methods: {
      // Fetch quiz information and questions from the backend
      async fetchQuestions() {
        try {
          const quizId = this.$route.params.quizId;
          const questionId = this.$route.params.questionId || 1; // Default to the first question if not provided
  
          const response = await fetch(`/start_quiz/${quizId}/${questionId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            this.quizInfo = data;
            this.questions = data.questions || [];
            this.currentQuestionIndex = data.current_question_index - 1; // Convert to zero-based index
            this.selectedQuestionId = data.current_question.question_id;
  
            // Start the timer
            const [hours, minutes, seconds] = data.time_duration.split(':').map(Number);
            this.timeLeft = hours * 3600 + minutes * 60 + seconds;
            this.startTimer();
          } else {
            console.error('Failed to fetch quiz information');
          }
        } catch (error) {
          console.error('Error fetching quiz information:', error);
        }
      },
      // Load a specific question
      loadQuestion() {
        const questionIndex = this.questions.findIndex((q) => q.id === this.selectedQuestionId);
        if (questionIndex !== -1) {
          this.currentQuestionIndex = questionIndex;
        }
      },
      // Save the selected answer and move to the next question
      async saveAnswer() {
        if (!this.selectedAnswer) {
          alert('Please select an option to continue.');
          return;
        }
  
        try {
          const response = await fetch('/save_and_next', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify({
              quiz_id: this.quizId,
              question_id: this.currentQuestion.id,
              user_answer: this.selectedAnswer,
            }),
          });
  
          if (response.ok) {
            const data = await response.json();
            this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.questions.length;
            this.selectedQuestionId = this.questions[this.currentQuestionIndex].id;
            this.selectedAnswer = null; // Reset selected answer
          } else {
            const data = await response.json();
            alert(data.message || 'Failed to save answer.');
          }
        } catch (error) {
          console.error('Error saving answer:', error);
        }
      },
      // Submit the quiz
      async submitQuiz() {
        try {
          const response = await fetch('/submit_quiz', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify({
              quiz_id: this.quizId,
              question_id: this.currentQuestion.id,
              user_answer: this.selectedAnswer,
            }),
          });
  
          if (response.ok) {
            const data = await response.json();
            this.$router.push(data.redirect_url); // Redirect to the URL provided by the backend
          } else {
            const data = await response.json();
            alert(data.message || 'Failed to submit quiz.');
          }
        } catch (error) {
          console.error('Error submitting quiz:', error);
        }
      },
      // Start the timer
      startTimer() {
        this.timerInterval = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft--;
          } else {
            clearInterval(this.timerInterval);
            this.submitQuiz(); // Automatically submit the quiz when time runs out
          }
        }, 1000);
      },
    },
    mounted() {
      this.quizId = this.$route.params.quizId; // Get quiz ID from the route
      this.fetchQuestions(); // Fetch quiz information and questions
    },
    beforeUnmount() {
      clearInterval(this.timerInterval); // Clear the timer when the component is unmounted
    },
  };
  
  // Scoped styles
  StartQuiz.style = `
    <style scoped>
      .start-quiz-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
  
      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: orange;
        padding: 10px;
        border: 2px solid black;
        border-radius: 5px;
        margin-bottom: 20px;
      }
  
      .status-item {
        color: black;
        font-weight: bold;
      }
  
      .status-item select {
        padding: 5px;
        border-radius: 5px;
        border: 1px solid black;
      }
  
      .question-container {
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
  
      .form-floating textarea {
        resize: none;
      }
  
      .form-check {
        margin-bottom: 10px;
      }
  
      .buttons {
        text-align: center;
        margin-top: 20px;
      }
  
      .btn {
        margin: 0 10px;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
      }
  
      .btn-success {
        background-color: #28a745;
        border-color: #28a745;
      }
  
      .btn-danger {
        background-color: #dc3545;
        border-color: #dc3545;
      }
  
      .btn-success:hover {
        background-color: #218838;
        border-color: #1e7e34;
      }
  
      .btn-danger:hover {
        background-color: #c82333;
        border-color: #bd2130;
      }
    </style>
  `;
  
  export default StartQuiz;