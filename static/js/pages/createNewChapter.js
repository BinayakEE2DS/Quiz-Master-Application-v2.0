const CreateNewChapter = {
    template: `
      <div>
        <!-- Main Container -->
        <div id="canvas">
          <div id="form-body">
            <div style="text-align: center;">
              <h4 style="color: blue;">New Chapter</h4><br>
              <!-- Form starts here -->
              <form @submit.prevent="saveChapter">
                <!-- Subject Name -->
                <div class="mb-3">
                  <label for="subjectName" class="form-label">Subject Name</label>
                  <input type="text" class="form-control" id="subjectName" :value="subject.name" readonly>
                </div>
                <!-- Chapter Name Field -->
                <div class="mb-3">
                  <label for="chapterName" class="form-label">Chapter Name</label>
                  <input type="text" class="form-control" id="chapterName" v-model="chapterName" placeholder="eg. Straight lines" required>
                </div>
                <!-- Description for Chapter -->
                <div class="form-floating">
                  <textarea class="form-control" placeholder="Leave a comment here" id="description" v-model="description" style="height: 200px" required></textarea>
                  <label for="description">Description</label><br>
                </div>
                <!-- Buttons -->
                <button type="submit" class="btn btn-success">Save</button>
                <router-link to="/admin" class="btn btn-danger">Cancel</router-link>
              </form>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        subject: {}, // Subject details
        chapterName: '', // Chapter name input
        description: '', // Chapter description input
      };
    },
    methods: {
      // Fetch subject details based on the subject ID from the route
      async fetchSubject() {
        const subjectId = this.$route.params.subject_id;
        try {
          const response = await fetch(`/admin`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.subject = data.subjects.find(subject => subject.id === parseInt(subjectId));
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching subject:', error);
        }
      },
      // Save the new chapter
      async saveChapter() {
        const subjectId = this.$route.params.subject_id;
        const newChapter = {
          name: this.chapterName,
          description: this.description,
        };

        try {
          const response = await fetch(`/create_new_chapter/${subjectId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify(newChapter),
          });
          if (response.ok) {
            alert('Chapter created successfully');
            this.$router.push('/admin'); // Redirect to admin dashboard
          } else {
            const data = await response.json();
            alert(data.message || 'Failed to create chapter');
          }
        } catch (error) {
          console.error('Error creating chapter:', error);
        }
      },
    },
    mounted() {
      this.fetchSubject(); // Fetch subject details when the component is mounted
    },
  };

  // Scoped styles for the component
  CreateNewChapter.style = `
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

      .form-control {
        margin-bottom: 15px;
      }

      .btn {
        margin: 5px;
      }
    </style>
  `;

  export default CreateNewChapter;