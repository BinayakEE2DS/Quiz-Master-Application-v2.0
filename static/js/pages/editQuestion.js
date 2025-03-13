const EditQuestion = {
    template: `
      <div id="main">
        <div id="canvas">
          <div id="form-body">
            <h4 style="color: blue; text-align: center">Edit Question</h4><br>
            <form @submit.prevent="saveQuestion">
              <!-- Chapter Name -->
              <div class="mb-3">
                <label for="chapterName" class="form-label">Chapter Name:</label>
                <input type="text" class="form-control" id="chapterName" :value="chapterName" readonly>
              </div>
              <!-- Question Topic -->
              <div class="mb-3">
                <label for="questionTopic" class="form-label">Question Topic:</label>
                <input type="text" class="form-control" id="questionTopic" v-model="questionTopic" placeholder="Enter Question Topic" required>
              </div>
              <!-- Question Statement -->
              <div class="form-floating">
                <textarea class="form-control" placeholder="Leave a comment here" id="questionStatement" v-model="questionStatement" style="height: 100px" required></textarea>
                <label for="questionStatement">Question Statement</label><br>
              </div>
              <h4 style="color: orangered; text-align: center">Single option correct</h4><br>
              <div class="form-horizontal">
                <!-- Options for answer -->
                <div class="mb-3">
                  <label for="option1" class="form-label">Option 1:</label>
                  <input type="text" class="form-control" id="option1" v-model="option1" placeholder="Enter Option 1" required>
                </div>
                <div class="mb-3">
                  <label for="option2" class="form-label">Option 2:</label>
                  <input type="text" class="form-control" id="option2" v-model="option2" placeholder="Enter Option 2" required>
                </div>
                <div class="mb-3">
                  <label for="option3" class="form-label">Option 3:</label>
                  <input type="text" class="form-control" id="option3" v-model="option3" placeholder="Enter Option 3" required>
                </div>
                <div class="mb-3">
                  <label for="option4" class="form-label">Option 4:</label>
                  <input type="text" class="form-control" id="option4" v-model="option4" placeholder="Enter Option 4" required>
                </div>
                <!-- Correct Option -->
                <div class="mb-3">
                  <label for="correctOption" class="form-label">Correct Option:</label>
                  <select class="form-control" id="correctOption" v-model="correctOption" required>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                    <option value="4">Option 4</option>
                  </select>
                </div>
              </div>
              <!-- Buttons -->
              <div class="Buttons" style="text-align: center;">
                <button type="submit" class="btn btn-success">Save & Next</button>
                <router-link to="/quiz_management" class="btn btn-danger">Close</router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        chapterName: '', // Prefilled chapter name
        questionTopic: '', // Question topic input
        questionStatement: '', // Question statement input
        option1: '', // Option 1 input
        option2: '', // Option 2 input
        option3: '', // Option 3 input
        option4: '', // Option 4 input
        correctOption: '1', // Correct option input (default to Option 1)
        questionId: this.$route.params.question_id, // Question ID from the route
      };
    },
    methods: {
      // Fetch the question details based on the question ID
      async fetchQuestionDetails() {
        try {
          const response = await fetch(`/edit_question/${this.questionId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.chapterName = data.chapter_name;
            this.questionTopic = data.question_topic;
            this.questionStatement = data.question_statement;
            this.option1 = data.option_1;
            this.option2 = data.option_2;
            this.option3 = data.option_3;
            this.option4 = data.option_4;
            this.correctOption = data.correct_option.toString();
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching question details:', error);
        }
      },
      // Save the updated question
      async saveQuestion() {
        const questionData = {
          question_topic: this.questionTopic,
          question_statement: this.questionStatement,
          option_1: this.option1,
          option_2: this.option2,
          option_3: this.option3,
          option_4: this.option4,
          correct_option: parseInt(this.correctOption),
        };

        try {
          const response = await fetch(`/edit_question/${this.questionId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify(questionData),
          });
          const data = await response.json();
          if (response.ok) {
            alert('Question updated successfully');
            this.$router.push('/quiz_management'); // Redirect to quiz management page
          } else {
            alert(data.message || 'Failed to update question');
          }
        } catch (error) {
          console.error('Error updating question:', error);
        }
      },
    },
    mounted() {
      this.fetchQuestionDetails(); // Fetch the question details when the component is mounted
    },
  };

  // Scoped styles for the component
  EditQuestion.style = `
    <style scoped>
      #main {
        border: 2px solid black;
        background-color: orange;
      }
      #canvas {
        border: 2px solid black;
        width: 80%;
        margin: auto;
        height: 800px;
        background-color: black;
      }
      #form-body {
        border: 2px solid black;
        width: 500px;
        height: 760px;
        margin: auto;
        margin-top: 25px;
        padding: 20px;
        border-radius: 5px;
        background-color: white;
      }
      .form-control {
        margin-bottom: 15px;
      }
      .btn {
        margin: 5px;
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
    </style>
  `;

  export default EditQuestion;