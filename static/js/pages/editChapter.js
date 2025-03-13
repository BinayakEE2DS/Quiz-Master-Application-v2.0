const EditChapter = {
    template: `
      <div>
        <!-- Main Container -->
        <div id="canvas">
          <div id="form-body">
            <div style="text-align: center;">
              <h4 style="color: blue;">Edit Chapter</h4><br>
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
                  <input type="text" class="form-control" id="chapterName" v-model="chapter.name" required>
                </div>
                <!-- Description for Chapter -->
                <div class="form-floating">
                  <textarea class="form-control" placeholder="Leave a comment here" id="description" v-model="chapter.description" style="height: 200px" required></textarea>
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
        chapter: {}, // Chapter details
      };
    },
    methods: {
      // Fetch chapter and subject details based on the chapter ID from the route
      async fetchChapter() {
        const chapterId = this.$route.params.chapter_id;
        try {
          const response = await fetch(`/edit_chapter/${chapterId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            this.chapter = data.chapter;
            this.subject = data.subject;
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching chapter:', error);
        }
      },
      // Save the updated chapter
      async saveChapter() {
        const chapterId = this.$route.params.chapter_id;
        const updatedChapter = {
          name: this.chapter.name,
          description: this.chapter.description,
        };

        try {
          const response = await fetch(`/edit_chapter/${chapterId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            },
            body: JSON.stringify(updatedChapter),
          });
          if (response.ok) {
            alert('Chapter updated successfully');
            this.$router.push('/admin'); // Redirect to admin dashboard
          } else {
            const data = await response.json();
            alert(data.message || 'Failed to update chapter');
          }
        } catch (error) {
          console.error('Error updating chapter:', error);
        }
      },
    },
    mounted() {
      this.fetchChapter(); // Fetch chapter and subject details when the component is mounted
    },
  };

  // Scoped styles for the component
  EditChapter.style = `
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

  export default EditChapter;