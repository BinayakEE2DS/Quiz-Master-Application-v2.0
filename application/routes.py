from .database import db 
from application.models import *
from datetime import datetime
from datetime import date
from flask import current_app as app, jsonify,Flask , request, render_template , redirect
from flask_security import Security, SQLAlchemyUserDatastore, hash_password
from sqlalchemy import and_, or_, func
from flask_security import auth_required, roles_required, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash
import matplotlib.pyplot as plt
import numpy as np
import os


############################################ ROUTE FUNCTIONALITIES COMMON FOR ADMIN/USER ###########################################

#Routing of home page of the application

@app.route('/', methods = ['GET'])
def home():
     return render_template('index.html')

# Routing for user/admin login operation

@app.route('/login', methods=['POST'])
def user_login():
    try:
        # Request validation for debugging purposes
        print(f"Request headers: {request.headers}")
        print(f"Request data type: {type(request.data)}")
        print(f"Raw request data: {request.data}")

        body = request.get_json()
        email = body.get('email')
        password = body.get('password')

        if not email or not password:
            return jsonify({"message": "Email and password are required!"}), 400

        # Debug log: Login attempt
        print(f"Login attempt for: {email}")

        user = app.security.datastore.find_user(email=email)
        
        # Debug log: User active status
        print(f"User active status: {user.active if user else 'No user'}")
        
        if not user:
            return jsonify({"message": "User not found!"}), 404

        # Verify password using Flask-Security's helper
        verification_result = app.security.datastore.verify_password(password, user)
        print(f"Password verification: {verification_result}")

        if not verification_result:
            # Additional debugging for password mismatch
            print(f"Compare '{password}' with hash: {user.password}")
            print(f"Hash matches: {check_password_hash(user.password, password)}")
            return jsonify({"message": "Incorrect password!"}), 400

        # Generate proper security token
        auth_token = user.get_auth_token()
        
        # Get roles
        roles = [role.name for role in user.roles]

        return jsonify({
            "id": user.id,
            "email": user.email,
            "roles": roles,
            "auth-token": auth_token
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Server error during login"}), 500


# Routing for user/admin logout operation


@app.route('/logout', methods=['POST'])
@auth_required('token')  # Ensure only authenticated users can access this route
def user_logout():
    
    return jsonify({
        "message": "Logged out successfully"
    }), 200



# Routing for Registration page operation 

@app.route('/register', methods=['POST'])
def create_user():
    try:
        credentials = request.get_json()
        if not credentials:
            return jsonify({"message": "Missing JSON data"}), 400

        # Validate required fields
        required_fields = ['email', 'username', 'password', 'date_of_birth', 'qualification', 'fullname']
        missing = [field for field in required_fields if field not in credentials]
        if missing:
            return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

        # Validate date format
        try:
            dob = datetime.strptime(credentials["date_of_birth"], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

        # Check existing user
        if app.security.datastore.find_user(email=credentials["email"]):
            return jsonify({"message": "User already exists!"}), 400
        

        # Create new user
        new_user = app.security.datastore.create_user(
            email=credentials["email"],
            username=credentials["username"],
            password=hash_password(credentials["password"]),
            date_of_birth=dob,
            qualification=credentials["qualification"],
            fullname=credentials["fullname"],
            active=True
        )

        # Handle roles
        user_role = app.security.datastore.find_or_create_role(name="user", description="Regular user")
        app.security.datastore.add_role_to_user(new_user, user_role)

        # Commit with error handling
        try:
            db.session.commit()
            return jsonify({"message": "User created successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Database error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500


############################################ ROUTE FUNCTIONALITIES FOR ADMIN ###########################################


# Routing for admin dashboard page

@app.route('/admin', methods=['GET'])
@auth_required('token')  # Token-based authentication
@roles_required('admin')  # Role-based access control (admin only)
def admin_home():
    # Fetch the admin user
    admin_user = current_user

    # Fetch all subjects, chapters, and quizzes from the database
    subjects = Subject.query.all()
    chapters = Chapter.query.all()
    quizzes = Quiz.query.all()

    # Convert database objects to JSON-serializable format
    subjects_data = [{
        "id": s.id,
        "name": s.name,
        "description": s.description
        } for s in subjects]
    
    chapters_data = [{
        "id": c.id,
        "name": c.name,
        "subject_id": c.subject_id,
        "description": c.description
        } for c in chapters]
    
    quizzes_data = [{
        "id": q.id,
        "name": q.topic,
        "subject_id": q.subject_id,
        "chapter_id": q.chapter_id,
        "date_of_quiz": q.date_of_quiz.isoformat(),
        "time_duration": q.time_duration.isoformat(),
        "no_of_questions": q.no_of_questions
        } for q in quizzes]

    # Return JSON response
    return jsonify({
        "message": "Admin logged in successfully",
        "user": {
            "id": admin_user.id,
            "username": admin_user.username,
            "email": admin_user.email
        },
        "subjects": subjects_data,
        "chapters": chapters_data,
        "quizzes": quizzes_data
    })



# Routing for admin quiz management page

@app.route('/quiz_management', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def admin_quiz_management():
    # Fetch all quizzes, chapters, and questions from the database
    quizzes = Quiz.query.all()
    chapters = Chapter.query.all()
    questions = Question.query.all()

    # Convert database objects to JSON-serializable format
    quizzes_data = [{
        "id": q.id,
        "subject_id": q.subject_id,
        "chapter_id": q.chapter_id,
        "date_of_quiz": q.date_of_quiz.isoformat(),
        "time_duration": q.time_duration.isoformat(),
        "topic": q.topic,
        "no_of_questions": q.no_of_questions
    } for q in quizzes]

    chapters_data = [{
        "id": c.id,
        "subject_id": c.subject_id,
        "name": c.name,
        "description": c.description
    } for c in chapters]

    questions_data = [{
        "id": q.id,
        "quiz_id": q.quiz_id,
        "subject_id": q.subject_id,
        "chapter_id": q.chapter_id,
        "question_topic": q.question_topic,
        "question_statement": q.question_statement,
        "option_1": q.option_1,
        "option_2": q.option_2,
        "option_3": q.option_3,
        "option_4": q.option_4,
        "correct_option": q.correct_option
    } for q in questions]

    # Return JSON response
    return jsonify({
        "message": "Admin quiz management data fetched successfully",
        "quizzes": quizzes_data,
        "chapters": chapters_data,
        "questions": questions_data
    })



# Routing to implement create new subject functionality in admin dashboard page

@app.route('/create_new_subject', methods=['GET', 'POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def create_subject():
    if request.method == 'POST':
        # Get data from the request
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')

        # Validate the input
        if not name:
            return jsonify({
                "message": "Subject name is required!"
            }), 400

        # Check if the subject already exists
        if Subject.query.filter_by(name=name).first():
            return jsonify({
                "message": "Subject with this name already exists!"
            }), 400

        # Create a new subject
        new_subject = Subject(name=name, description=description)
        db.session.add(new_subject)
        db.session.commit()

        return jsonify({
            "message": "Subject created successfully",
            "subject": {
                "id": new_subject.id,
                "name": new_subject.name,
                "description": new_subject.description
            }
        }), 201

    # For GET requests, return a message indicating the endpoint is for creating a subject
    return jsonify({
        "message": "Use this endpoint to create a new subject. Send a POST request with 'name' and 'description'."
    })



# Routing to implement delete a subject functionality in admin dashboard page

@app.route('/delete_subject/<int:subject_id>', methods=['POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def delete_subject(subject_id):
    # Fetch the subject to be deleted
    subject = Subject.query.get_or_404(subject_id)

    try:
        # Delete the subject and all related data (cascade delete is handled by SQLAlchemy relationships)
        db.session.delete(subject)
        db.session.commit()

        return jsonify({
            "message": "Subject and all related data deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "An error occurred while deleting the subject",
            "error": str(e)
        }), 500
    
# Routing to implement create new chapter functionality in admin dashboard page

@app.route('/create_new_chapter/<int:subject_id>', methods=['GET', 'POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def create_chapter(subject_id):
    # Fetch the subject details
    subject = Subject.query.get_or_404(subject_id)

    if request.method == 'POST':
        # Get data from the request
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')

        # Validate the input
        if not name:
            return jsonify({
                "message": "Chapter name is required!"
            }), 400

        # Check if the chapter already exists
        if Chapter.query.filter_by(name=name, subject_id=subject_id).first():
            return jsonify({
                "message": "Chapter with this name already exists for this subject!"
            }), 400

        # Create a new chapter
        new_chapter = Chapter(
            subject_id=subject.id,
            name=name,
            description=description
        )
        db.session.add(new_chapter)
        db.session.commit()

        return jsonify({
            "message": "Chapter created successfully",
            "chapter": {
                "id": new_chapter.id,
                "name": new_chapter.name,
                "description": new_chapter.description,
                "subject_id": new_chapter.subject_id
            }
        }), 201

    # For GET requests, return a message indicating the endpoint is for creating a chapter
    return jsonify({
        "message": "Use this endpoint to create a new chapter. Send a POST request with 'name' and 'description'."
    })



# Routing to implement edit chapter functionality in admin dashboard page

@app.route('/edit_chapter/<int:chapter_id>', methods=['GET', 'POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def edit_chapter(chapter_id):
    # Fetch the chapter details
    chapter = Chapter.query.get_or_404(chapter_id)
    subject = Subject.query.get_or_404(chapter.subject_id)

    if request.method == 'POST':
        # Get data from the request
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')

        # Validate the input
        if not name:
            return jsonify({
                "message": "Chapter name is required!"
            }), 400

        # Update the chapter details
        chapter.name = name
        chapter.description = description

        # Commit changes to the database
        db.session.commit()

        return jsonify({
            "message": "Chapter updated successfully",
            "chapter": {
                "id": chapter.id,
                "name": chapter.name,
                "description": chapter.description,
                "subject_id": chapter.subject_id
            }
        }), 200

    # For GET requests, return the existing chapter details
    return jsonify({
        "chapter": {
            "id": chapter.id,
            "name": chapter.name,
            "description": chapter.description,
            "subject_id": chapter.subject_id
        },
        "subject": {
            "id": subject.id,
            "name": subject.name,
            "description": subject.description
        }
    })



# Routing to implement delete chapter functionality in admin dashboard page

@app.route('/delete_chapter/<int:chapter_id>', methods=['POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def delete_chapter(chapter_id):
    # Fetch the chapter to be deleted
    chapter = Chapter.query.get_or_404(chapter_id)

    try:
        # Fetch all quizzes associated with the chapter
        quizzes = Quiz.query.filter_by(chapter_id=chapter.id).all()

        # Delete all questions associated with the quizzes
        for quiz in quizzes:
            Question.query.filter_by(quiz_id=quiz.id).delete()

        # Delete all quizzes associated with the chapter
        Quiz.query.filter_by(chapter_id=chapter.id).delete()

        # Delete the chapter
        db.session.delete(chapter)

        # Commit changes to the database
        db.session.commit()

        return jsonify({
            "message": "Chapter and all related data deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "An error occurred while deleting the chapter",
            "error": str(e)
        }), 500



# Routing to implement new quiz functionality in admin quiz management page

@app.route('/create_new_quiz', methods=['GET', 'POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def create_quiz():
    if request.method == 'POST':
        # Get data from the request
        data = request.get_json()
        subject_id = data.get('subject_id')
        chapter_id = data.get('chapter_id')
        date_string = data.get('date')
        duration_string = data.get('duration')

        # Validate the input
        if not subject_id or not chapter_id or not date_string or not duration_string:
            return jsonify({
                "message": "All fields are required!"
            }), 400

        # Validate and convert date
        try:
            date = datetime.strptime(date_string, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                "message": "Invalid date format. Expected YYYY-MM-DD."
            }), 400

        # Validate and convert duration
        try:
            # Append ":00" to make it HH:MM:SS for HH:MM format
            duration_string = f"{duration_string}:00"
            duration = datetime.strptime(duration_string, '%H:%M:%S').time()
        except ValueError:
            return jsonify({
                "message": "Invalid duration format. Expected HH:MM."
            }), 400

        # Create a new Quiz entry
        new_quiz = Quiz(
            subject_id=subject_id,
            chapter_id=chapter_id,
            date_of_quiz=date,
            time_duration=duration,
            no_of_questions=0  # Initialize with 0 questions
        )

        # Add and commit to the database
        db.session.add(new_quiz)
        db.session.commit()

        return jsonify({
            "message": "Quiz created successfully",
            "quiz": {
                "id": new_quiz.id,
                "subject_id": new_quiz.subject_id,
                "chapter_id": new_quiz.chapter_id,
                "date_of_quiz": new_quiz.date_of_quiz.isoformat(),
                "time_duration": new_quiz.time_duration.isoformat(),
                "no_of_questions": new_quiz.no_of_questions
            }
        }), 201

    # For GET requests, return a message indicating the endpoint is for creating a quiz
    return jsonify({
        "message": "Use this endpoint to create a new quiz. Send a POST request with 'subject_id', 'chapter_id', 'date', and 'duration'."
    })



# Routing to implement delete quiz functionality in admin quiz management page

@app.route('/delete_quiz/<int:quiz_id>', methods=['POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def delete_quiz(quiz_id):
    try:
        # Fetch the quiz to be deleted
        quiz = Quiz.query.get_or_404(quiz_id)

        # Delete all related questions
        Question.query.filter_by(quiz_id=quiz.id).delete()

        # Delete all related scores
        Score.query.filter_by(quiz_id=quiz.id).delete()

        # Delete all related quiz statuses
        QuizStatus.query.filter_by(quiz_id=quiz.id).delete()

        # Delete all related quiz performances
        QuizPerformance.query.filter_by(quiz_id=quiz.id).delete()

        # Delete the quiz
        db.session.delete(quiz)

        # Commit changes to the database
        db.session.commit()

        return jsonify({
            "message": "Quiz and all related data deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "An error occurred while deleting the quiz",
            "error": str(e)
        }), 500
    



# Routing to implement new question functionality in admin quiz management page

@app.route('/create_new_question/<int:quiz_id>', methods=['GET', 'POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def create_question(quiz_id):
    # Fetch the quiz and chapter details
    quiz = Quiz.query.get_or_404(quiz_id)
    chapter = Chapter.query.get_or_404(quiz.chapter_id)

    if request.method == 'POST':
        # Get data from the request
        data = request.get_json()
        question_statement = data.get('question_statement')
        question_topic = data.get('question_topic')
        option_1 = data.get('option_1')
        option_2 = data.get('option_2')
        option_3 = data.get('option_3')
        option_4 = data.get('option_4')
        correct_option = data.get('correct_option')

        # Validate the input
        if not question_statement or not question_topic or not option_1 or not option_2 or not option_3 or not option_4 or not correct_option:
            return jsonify({
                "message": "All fields are required!"
            }), 400

        # Validate correct_option (must be between 1 and 4)
        if correct_option not in [1, 2, 3, 4]:
            return jsonify({
                "message": "Correct option must be between 1 and 4."
            }), 400

        # Create a new Question entry
        new_question = Question(
            quiz_id=quiz.id,
            subject_id=quiz.subject_id,
            chapter_id=quiz.chapter_id,
            question_statement=question_statement,
            question_topic=question_topic,
            option_1=option_1,
            option_2=option_2,
            option_3=option_3,
            option_4=option_4,
            correct_option=correct_option
        )

        # Add and commit to the database
        db.session.add(new_question)

        # Update the number of questions in the Quiz table
        quiz.no_of_questions = Question.query.filter_by(quiz_id=quiz.id).count()
        db.session.commit()

        return jsonify({
            "message": "Question created successfully",
            "question": {
                "id": new_question.id,
                "quiz_id": new_question.quiz_id,
                "subject_id": new_question.subject_id,
                "chapter_id": new_question.chapter_id,
                "question_statement": new_question.question_statement,
                "question_topic": new_question.question_topic,
                "option_1": new_question.option_1,
                "option_2": new_question.option_2,
                "option_3": new_question.option_3,
                "option_4": new_question.option_4,
                "correct_option": new_question.correct_option
            }
        }), 201

    # For GET requests, return the quiz and chapter details
    return jsonify({
        "quiz": {
            "id": quiz.id,
            "subject_id": quiz.subject_id,
            "chapter_id": quiz.chapter_id,
            "topic": quiz.topic,
            "no_of_questions": quiz.no_of_questions
        },
        "chapter": {
            "id": chapter.id,
            "name": chapter.name,
            "description": chapter.description
        }
    })  



# Routing to implement edit question functionality in admin quiz management page

@app.route('/edit_question/<int:question_id>', methods=['GET', 'POST'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def edit_question(question_id):
    # Fetch the question details
    question = Question.query.get_or_404(question_id)
    quiz = Quiz.query.get_or_404(question.quiz_id)
    chapter = Chapter.query.get_or_404(quiz.chapter_id)

    if request.method == 'POST':
        # Update the question details with form data
        question.question_topic = request.form.get('question_topic')
        question.question_statement = request.form.get('question_statement')
        question.option_1 = request.form.get('option1')
        question.option_2 = request.form.get('option2')
        question.option_3 = request.form.get('option3')
        question.option_4 = request.form.get('option4')
        question.correct_option = int(request.form.get('correct_option'))

        # Commit changes to the database
        db.session.commit()

        return jsonify({'message': 'Question updated successfully'}), 200

    # For GET requests, return the question details as JSON
    return jsonify({
        'question_id': question.id,
        'quiz_id': quiz.id,
        'chapter_name': chapter.name,
        'question_topic': question.question_topic,
        'question_statement': question.question_statement,
        'option_1': question.option_1,
        'option_2': question.option_2,
        'option_3': question.option_3,
        'option_4': question.option_4,
        'correct_option': question.correct_option
    })


# Routing to implement delete question functionality in admin quiz management page

@app.route('/delete_question/<int:question_id>', methods=['DELETE'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def delete_question(question_id):
    # Fetch the question to be deleted
    question = Question.query.get_or_404(question_id)
    
    # Fetch the associated quiz
    quiz = Quiz.query.get_or_404(question.quiz_id)

    # Delete the question from the database
    db.session.delete(question)
    
    # Update the number of questions in the quiz
    quiz.no_of_questions = Question.query.filter_by(quiz_id=quiz.id).count()
    
    # Commit changes to the database
    db.session.commit()

    # Return a success message
    return jsonify({'message': 'Question deleted successfully'}), 200



# Routing to implement visualization of question information functionality in admin quiz management page

@app.route('/quiz_information/<int:quiz_id>', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def quiz_info(quiz_id):
    # Fetch the quiz details
    quiz = Quiz.query.get_or_404(quiz_id)
    subject = Subject.query.get_or_404(quiz.subject_id)
    chapter = Chapter.query.get_or_404(quiz.chapter_id)

    # Prepare the response data
    quiz_info = {
        'quiz_id': quiz.id,
        'subject_name': subject.name,
        'chapter_name': chapter.name,
        'no_of_questions': quiz.no_of_questions,
        'time_duration': quiz.time_duration.strftime('%H:%M:%S'),  # Format time duration
        'scheduled_date': quiz.date_of_quiz.strftime('%Y-%m-%d'),  # Format scheduled date
    }

    return jsonify(quiz_info), 200



# Routing to implement search fuctionality for admin search operation 

@app.route('/admin_search', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated
@roles_required('admin')  # Ensure the user has the 'admin' role
def admin_search():
    search_query = request.args.get('search')  # Get the search query from the URL parameters

    # Perform the search query
    if search_query:
        # Search for quizzes based on subject name, chapter name, or quiz ID
        results = db.session.query(Quiz, Subject, Chapter) \
            .join(Subject, Quiz.subject_id == Subject.id) \
            .join(Chapter, Quiz.chapter_id == Chapter.id) \
            .filter(
                (Subject.name.ilike(f'%{search_query}%')) |
                (Chapter.name.ilike(f'%{search_query}%')) |
                (Quiz.id == search_query)
            ) \
            .all()
    else:
        results = []

    # Prepare the response data
    search_results = []
    for quiz, subject, chapter in results:
        search_results.append({
            'subject_name': subject.name,
            'chapter_name': chapter.name,
            'quiz_id': quiz.id,
            'no_of_questions': quiz.no_of_questions,
            'scheduled_date': quiz.date_of_quiz.strftime('%Y-%m-%d'),  # Format scheduled date
            'time_duration': quiz.time_duration.strftime('%H:%M:%S'),  # Format time duration
        })

    return jsonify(search_results), 200



# Routing to implement admin summary charts page 

@app.route('/admin_summary_charts')
@auth_required('token')
@roles_required('admin')
def admin_summary_charts():
    # Generate the summary charts and save the image
    chart_path = generate_summary_charts()
    
    # Return the path to the generated chart image as JSON
    return jsonify({'chart_path': chart_path})

# Function to generate bar charts for admin summary statistics page

def generate_summary_charts():
    # Fetch all subjects
    subjects = Subject.query.all()
    
    # Create a figure with subplots
    n = int(len(subjects) / 2 if len(subjects) % 2 == 0 else len(subjects) // 2 + 1)
    # plt.figure(figsize=(20, 5 * n))
    
    for i, subject in enumerate(subjects):
        # Fetch all quizzes for the subject
        quizzes = Quiz.query.filter_by(subject_id=subject.id).all()
        
        # Calculate total marks for the subject
        total_marks = sum(quiz.no_of_questions for quiz in quizzes)
        
        # Fetch all users whose role is not "admin"
        users = User.query.filter(User.roles.any(name='user')).all()
        
        user_names = [user.username for user in users]
        
        # Calculate marks obtained by each user for the subject
        user_marks = []
        for user in users:
            marks_obtained = 0
            for quiz in quizzes:
                quiz_performances = QuizPerformance.query.filter_by(user_id=user.id, quiz_id=quiz.id).all()
                marks_obtained += sum(qp.question_score for qp in quiz_performances)
            user_marks.append(marks_obtained)
        
        # Plot the bar chart
        plt.rcParams['figure.figsize']=[20,16]
        plt.subplot(n, 2, i + 1)
        colors = plt.get_cmap('coolwarm', len(users))
        plt.bar(user_names, user_marks, label=user_names, color=colors(range(len(users))))
        plt.title(f"Performance in {subject.name} out of {total_marks}", fontsize=14)
        plt.xlabel("Users", fontsize=12)
        plt.ylabel("Marks Scored", fontsize=12)
        plt.ylim(0, total_marks)  # Set y-axis limit dynamically
        plt.legend(fontsize=12)
    
    # Save the figure to the static folder
    chart_path = os.path.join('static', 'summary_chart.png')
    plt.tight_layout()
    plt.savefig(chart_path)
    plt.close()
    
    return chart_path



############################################ ROUTE FUNCTIONALITIES FOR USER ###########################################



# Routing to implement functionality for user dashboard page


@app.route('/user_dashboard', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated using token-based authentication
@roles_required('user')  # Ensure the user has the 'user' role
def user_dashboard():
    user_id = current_user.id  # Get the logged-in user's ID
    username = current_user.username  # Get the logged-in user's username

    # Fetch all quizzes for the current user in the session
    quizzes = Quiz.query.all()

    # Initialize QuizStatus entries for the user if they don't exist
    for quiz in quizzes:
        quiz_status = QuizStatus.query.filter_by(user_id=user_id, quiz_id=quiz.id).first()
        if not quiz_status:
            quiz_status = QuizStatus(user_id=user_id, quiz_id=quiz.id, status='unattempted')
            db.session.add(quiz_status)
    db.session.commit()

    # Update QuizStatus for expired quizzes
    for quiz in quizzes:
        if (quiz.date_of_quiz < date.today()):  # Check if the quiz date has passed
            quiz_status = QuizStatus.query.filter_by(user_id=user_id, quiz_id=quiz.id).first()
            if quiz_status and quiz_status.status == 'unattempted':
                quiz_status.status = 'quiz expired'
                db.session.commit()

    # Define the join condition between Quiz and QuizStatus datatables
    join_condition = Quiz.id == QuizStatus.quiz_id

    # Define the filter conditions for unattempted upcoming quizzes
    filter_conditions = and_(
        QuizStatus.user_id == user_id,  # Filter by the logged-in user
        QuizStatus.status == 'unattempted',  # Filter by unattempted status
        Quiz.date_of_quiz >= date.today()  # Filter by upcoming quizzes
    )

    # Perform the query
    upcoming_unattempted_quizzes = (
        db.session.query(Quiz)
        .join(QuizStatus, join_condition)  # Join Quiz and QuizStatus
        .filter(filter_conditions)  # Apply the filter conditions
        .all()  # Fetch all matching quizzes
    )

    # Prepare the response data
    quizzes_data = []
    for quiz in upcoming_unattempted_quizzes:
        quizzes_data.append({
            'quiz_id': quiz.id,
            'no_of_questions': quiz.no_of_questions,
            'time_duration': quiz.time_duration.strftime('%H:%M:%S'),  # Format time duration
            'date_of_quiz': quiz.date_of_quiz.strftime('%Y-%m-%d'),  # Format quiz date
        })

    # Return the username and quizzes data
    return jsonify({
        'username': username,
        'quizzes': quizzes_data
    }), 200



# Routing to implement quiz information display functionality in user dashboard page


@app.route('/user_quiz_information/<int:quiz_id>', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated using token-based authentication
@roles_required('user')  # Ensure the user has the 'user' role
def user_quiz_information(quiz_id):
    # Fetch the quiz details
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Fetch the associated subject and chapter details
    subject = Subject.query.get_or_404(quiz.subject_id)
    chapter = Chapter.query.get_or_404(quiz.chapter_id)

    # Prepare the response data
    quiz_info = {
        'quiz_id': quiz.id,
        'subject_name': subject.name,
        'chapter_name': chapter.name,
        'no_of_questions': quiz.no_of_questions,
        'time_duration': quiz.time_duration.strftime('%H:%M:%S'),  # Format time duration
        'scheduled_date': quiz.date_of_quiz.strftime('%Y-%m-%d'),  # Format scheduled date
    }

    return jsonify(quiz_info), 200



# Routing to implement start quiz functionality in user dashboard page


@app.route('/start_quiz/<int:quiz_id>/<int:question_id>', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated using token-based authentication
@roles_required('user')  # Ensure the user has the 'user' role
def start_quiz(quiz_id, question_id):
    # Fetch the quiz
    quiz = Quiz.query.get_or_404(quiz_id)

    # Update QuizStatus to 'attempted' for the current user and quiz
    quiz_status = QuizStatus.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).first()
    if quiz_status and quiz_status.status == 'unattempted':
        quiz_status.status = 'attempted'
        db.session.commit()

    # Fetch all questions for the quiz
    questions = Question.query.filter_by(quiz_id=quiz_id).order_by(Question.id).all()

    # Fetch the current question
    current_question = Question.query.get_or_404(question_id)

    # Calculate the current question's index
    current_question_index = next((index for index, q in enumerate(questions) if q.id == question_id), 0) + 1

    # Prepare the response data
    quiz_info = {
        'quiz_id': quiz.id,
        'subject_name': quiz.quiz_subject.name,
        'chapter_name': quiz.quiz_chapter.name,
        'no_of_questions': quiz.no_of_questions,
        'time_duration': quiz.time_duration.strftime('%H:%M:%S'),  # Format time duration
        'scheduled_date': quiz.date_of_quiz.strftime('%Y-%m-%d'),  # Format scheduled date
        'current_question': {
            'question_id': current_question.id,
            'question_statement': current_question.question_statement,
            'option_1': current_question.option_1,
            'option_2': current_question.option_2,
            'option_3': current_question.option_3,
            'option_4': current_question.option_4,
        },
        'current_question_index': current_question_index,
        'total_questions': len(questions),
    }

    return jsonify(quiz_info), 200



# Routing to implement save answer functionality of save and next button of start quiz page


@app.route('/save_and_next', methods=['POST'])
@auth_required('token')  # Ensure the user is authenticated using token-based authentication
@roles_required('user')  # Ensure the user has the 'user' role
def save_and_next():
    # Get form data
    user_id = current_user.id
    quiz_id = request.json.get('quiz_id')
    question_id = request.json.get('question_id')
    user_answer = request.json.get('user_answer')

    # Fetch the current question
    question = Question.query.get_or_404(question_id)

    # Validate if an option is selected
    if not user_answer:
        return jsonify({'error': 'Please select an option to continue.'}), 400

    # Save the answer to QuizPerformance
    is_correct = int(user_answer) == question.correct_option
    question_score = 1 if is_correct else 0

    quiz_performance = QuizPerformance(
        user_id=user_id,
        quiz_id=quiz_id,
        question_id=question_id,
        user_answer=int(user_answer),
        question_score=question_score
    )
    db.session.add(quiz_performance)
    db.session.commit()

    # Fetch all questions for the quiz
    questions = Question.query.filter_by(quiz_id=quiz_id).order_by(Question.id).all()

    # Find the index of the current question
    current_index = next((index for index, q in enumerate(questions) if q.id == int(question_id)), 0)

    # Determine the next question ID
    next_index = (current_index + 1) % len(questions)  # Loop back to the first question if at the end
    next_question_id = questions[next_index].id

    return jsonify({'next_question_id': next_question_id}), 200



# Routing to implement submit the quiz functionality of submit button of start quiz page


@app.route('/submit_quiz', methods=['POST'])
@auth_required('token')  # Ensure the user is authenticated using token-based authentication
@roles_required('user')  # Ensure the user has the 'user' role
def submit_quiz():
    # Get form data
    quiz_id = request.json.get('quiz_id')
    question_id = request.json.get('question_id')
    user_answer = request.json.get('user_answer')

    # Fetch the current question
    question = Question.query.get_or_404(question_id)

    # Save the answer to QuizPerformance if an option is selected
    if user_answer:
        is_correct = int(user_answer) == question.correct_option
        question_score = 1 if is_correct else 0

        quiz_performance = QuizPerformance(
            user_id=current_user.id,  # Use current_user.id from the token
            quiz_id=quiz_id,
            question_id=question_id,
            user_answer=int(user_answer),
            question_score=question_score
        )
        db.session.add(quiz_performance)
        db.session.commit()

    # Evaluate the quiz and save the results to the Score table
    return evaluate_quiz_and_redirect(quiz_id)


# Function to implement evaluation of quiz and redirect to user score page on submit button operation

def evaluate_quiz_and_redirect(quiz_id):
    # Fetch all questions for the quiz
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    total_questions = len(questions)

    # Fetch the latest QuizPerformance entry for each question
    latest_performances = (
        db.session.query(
            QuizPerformance.question_id,
            func.max(QuizPerformance.id).label('latest_id')
        )
        .filter_by(user_id=current_user.id, quiz_id=quiz_id)  # Use current_user.id
        .group_by(QuizPerformance.question_id)
        .subquery()
    )

    # Join with QuizPerformance to get the latest scores
    quiz_performances = (
        db.session.query(QuizPerformance)
        .join(
            latest_performances,
            QuizPerformance.id == latest_performances.c.latest_id
        )
        .all()
    )

    # Calculate the user's score based on the latest answers
    user_score = sum(performance.question_score for performance in quiz_performances)

    # Fetch the quiz to get subject_id and chapter_id
    quiz = Quiz.query.get_or_404(quiz_id)

    # Save the results to the Score table
    score_entry = Score(
        quiz_id=quiz_id,
        user_id=current_user.id,  # Use current_user.id
        subject_id=quiz.subject_id,
        chapter_id=quiz.chapter_id,
        time_stamp_of_attempt=datetime.now().date(),
        total_score=user_score,
        full_score=total_questions  # Total marks is the number of questions
    )
    db.session.add(score_entry)
    db.session.commit()

    # Redirect the user to the user_scores page
    return jsonify({'redirect_url': '/user_scores'}), 200  

# Routing to implement user score page functionality 


@app.route('/user_scores', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated using token-based authentication
@roles_required('user')  # Ensure the user has the 'user' role
def user_scores():
    user_id = current_user.id  # Get the logged-in user's ID
    username = current_user.username  # Get the logged-in user's username

    try:
        # Step 1: Check QuizStatus for quizzes with status "quiz expired"
        expired_quizzes = (
            db.session.query(QuizStatus.quiz_id)
            .filter_by(user_id=user_id, status="quiz expired")
            .all()
        )

        # Step 2: Update the Score table for expired quizzes
        for quiz_status in expired_quizzes:
            quiz_id = quiz_status.quiz_id

            # Fetch the quiz to get the number of questions
            quiz = Quiz.query.get_or_404(quiz_id)
            total_questions = quiz.no_of_questions

            # Check if a Score entry already exists for this quiz and user
            score_entry = Score.query.filter_by(user_id=user_id, quiz_id=quiz_id).first()

            if not score_entry:
                # Create a new Score entry if it doesn't exist
                score_entry = Score(
                    quiz_id=quiz_id,
                    user_id=user_id,
                    subject_id=quiz.subject_id,
                    chapter_id=quiz.chapter_id,
                    time_stamp_of_attempt=None,
                    total_score=0,
                    full_score=total_questions
                )
                db.session.add(score_entry)
            else:
                # Update the existing Score entry
                score_entry.time_stamp_of_attempt = None
                score_entry.total_score = 0
                score_entry.full_score = total_questions

        db.session.commit()

        # Step 3: Fetch all scores for the user with related Quiz, Subject, Chapter, and QuizStatus data
        scores = (
            db.session.query(Score, QuizStatus.status)
            .join(Quiz, Score.quiz_id == Quiz.id)
            .join(Subject, Quiz.subject_id == Subject.id)
            .join(Chapter, Quiz.chapter_id == Chapter.id)
            .outerjoin(QuizStatus, (QuizStatus.quiz_id == Score.quiz_id) & (QuizStatus.user_id == Score.user_id))
            .options(db.joinedload(Score.score_quiz).joinedload(Quiz.quiz_subject))
            .options(db.joinedload(Score.score_quiz).joinedload(Quiz.quiz_chapter))
            .filter(Score.user_id == user_id)
            .all()
        )

        # Step 4: Prepare the response data
        scores_data = []
        for score, status in scores:
            scores_data.append({
                'quiz_id': score.quiz_id,
                'subject_name': score.score_quiz.quiz_subject.name,
                'chapter_name': score.score_quiz.quiz_chapter.name,
                'no_of_questions': score.score_quiz.no_of_questions,
                'date_of_attempt': score.time_stamp_of_attempt.strftime('%Y-%m-%d') if score.time_stamp_of_attempt else '-',
                'status': status if status else 'N/A',
                'your_score': score.total_score,
                'total_marks': score.full_score  # Add total_marks to match frontend expectations
            })

        # Include the username in the response
        return jsonify({
            "username": username,
            "scores": scores_data
        }), 200

    except Exception as e:
        db.session.rollback()  # Rollback in case of any error
        return jsonify({
            "message": "An error occurred while fetching user scores",
            "error": str(e)
        }), 500
    
# Routing to implement search functionality for user


@app.route('/user_search', methods=['GET'])
@auth_required('token')  # Ensure the user is authenticated using token-based authentication
@roles_required('user')  # Ensure the user has the 'user' role
def user_search():
    search_query = request.args.get('search')  # Get the search query from the URL parameters

    # Perform the search query
    if search_query:
        # Search for quizzes based on subject name, chapter name, or quiz ID
        results = (
            db.session.query(Quiz, Subject, Chapter, QuizStatus)
            .join(Subject, Quiz.subject_id == Subject.id)
            .join(Chapter, Quiz.chapter_id == Chapter.id)
            .join(QuizStatus, Quiz.id == QuizStatus.quiz_id)
            .filter(
                and_(
                    QuizStatus.user_id == current_user.id,  # Ensure the quiz status belongs to the logged-in user
                    or_(
                        Subject.name.ilike(f'%{search_query}%'),
                        Chapter.name.ilike(f'%{search_query}%'),
                        Quiz.id == search_query
                    )
                )
            )
            .all()
        )
    else:
        results = []

    # Prepare the response data
    search_results = []
    for quiz, subject, chapter, quiz_status in results:
        search_results.append({
            'subject_name': subject.name,
            'chapter_name': chapter.name,
            'quiz_id': quiz.id,
            'no_of_questions': quiz.no_of_questions,
            'scheduled_date': quiz.date_of_quiz.strftime('%Y-%m-%d'),  # Format scheduled date
            'time_duration': quiz.time_duration.strftime('%H:%M:%S'),  # Format time duration
            'status': quiz_status.status,
        })

    return jsonify(search_results), 200




# Route to generate  user summary statistics charts page

# @app.route('/user_summary_charts', methods=['GET'])
# @auth_required('token')
# @roles_required('user')  # Ensure only users with the 'user' role can access this route
# def user_summary_charts():
#     # Get the logged-in user from the token
#     user = current_user

#     # Generate the summary chart and save the image
#     chart_path = generate_user_summary_charts(user.id)
    
#     # Return the path to the generated chart image as JSON
#     return jsonify({'chart_path': chart_path})

@app.route('/user_summary_charts', methods=['GET'])
@auth_required('token')
@roles_required('user')  # Ensure only users with the 'user' role can access this route
def user_summary_charts():
    # Get the logged-in user from the token
    user = current_user

    try:
        # Generate the summary chart and save the image
        chart_path = generate_user_summary_charts(user.id)
        
        # Return the full URL to the generated chart image as JSON
        chart_url = f"http://localhost:5000{chart_path}"  # Replace with your server's base URL
        return jsonify({
            'chart_path': chart_url,
            'username': user.username  # Include the username in the response
        })
    except Exception as e:
        return jsonify({
            "message": "An error occurred while generating the chart",
            "error": str(e)
        }), 500


def generate_user_summary_charts(user_id):
    # Fetch the user
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    # Fetch all subjects
    subjects = Subject.query.all()

    # Prepare data for plotting
    subject_names = []
    subject_marks = []
    total_marks_list = []

    for subject in subjects:
        # Fetch all quizzes for the subject
        quizzes = Quiz.query.filter_by(subject_id=subject.id).all()

        # Calculate total marks for the subject
        total_marks = sum(quiz.no_of_questions for quiz in quizzes)

        # Calculate marks obtained by the user for the subject
        marks_obtained = 0
        for quiz in quizzes:
            quiz_performances = QuizPerformance.query.filter_by(user_id=user.id, quiz_id=quiz.id).all()
            marks_obtained += sum(qp.question_score for qp in quiz_performances)

        # Append data for plotting
        subject_names.append(subject.name)
        subject_marks.append(marks_obtained)
        total_marks_list.append(total_marks)

    # Plot the bar chart
    plt.figure(figsize=(10, 6))
    colors = plt.cm.coolwarm(np.linspace(0, 1, len(subject_names)))  # Generate distinct colors

    bars = plt.bar(subject_names, subject_marks, color=colors)

    # Add labels and title
    plt.title(f"Performance of {user.username} in various subjects")
    plt.xlabel("Subjects")
    plt.ylabel("Marks Scored")
    plt.ylim(0, max(total_marks_list) + 10)  # Set y-axis limit dynamically
    plt.xticks(rotation=0, ha="center")  # Rotate x-axis labels for better readability

    # Add legend to the plot
    legend_labels = [f"Subject: {subject_names[i]} | Total marks: {total_marks_list[i]}" for i in range(len(subject_names))]
    plt.legend(bars, legend_labels, title="Subject Details", bbox_to_anchor=(1.05, 1), loc='upper left')

    # Save the figure to the static folder
    chart_filename = f'user_summary_chart_{user.id}.png'
    chart_path = os.path.join(app.static_folder, chart_filename)
    plt.tight_layout()
    plt.savefig(chart_path, bbox_inches='tight')  # Ensure the legend is not cut off
    plt.close()

    return chart_path  # Return the path for use in the frontend
