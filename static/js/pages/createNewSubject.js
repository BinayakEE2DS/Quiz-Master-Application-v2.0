const CreateNewSubject = {
    template: `
      <div>
        <!-- Main Container -->
        <div id="canvas">
          <div id="form-body">
            <div style="text-align: center;">
              <h4 style="color: blue;">New Subject</h4><br>
              <!-- Form starts here -->
              <form @submit.prevent="saveSubject">
                <!-- Subject Name Field -->
                <div class="mb-3">
                  <label for="subjectName" class="form-label">Subject Name</label>
                  <input type="text" class="form-control" id="subjectName" v-model="subjectName" placeholder="eg. Mathematics" required>
                </div>
                <!-- Subject Description Field -->
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
        subjectName: '', // Subject name input
        description: '', // Subject description input
      };
    },
    methods: {
      // Save the new subject
      async saveSubject() {
        const newSubject = {
          name: this.subjectName,
          description: this.description,
        };

        try {
          const response = await fetch('/create_new_subject', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify(newSubject),
          });
          if (response.ok) {
            alert('Subject created successfully');
            this.$router.push('/admin'); // Redirect to admin dashboard
          } else {
            const data = await response.json();
            alert(data.message || 'Failed to create subject');
          }
        } catch (error) {
          console.error('Error creating subject:', error);
        }
      },
    },
  };

  // Scoped styles for the component
  CreateNewSubject.style = `
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

  export default CreateNewSubject;