from flask import Flask
from application.database import db
from application.models import User, Role
from application.resources import api
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from datetime import datetime, date
from flask_security import hash_password

def create_app():
    app = Flask(__name__,static_folder="static")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    
    # Initialize Flask-Security
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    
    # Push application context
    app.app_context().push()
    return app

app = create_app()

# Create database tables and seed initial data
with app.app_context():
    # Create all database tables
    db.create_all()
    
    # Create roles if they don't exist
    admin_role = app.security.datastore.find_or_create_role(name="admin", description="Superuser of app")
    user_role = app.security.datastore.find_or_create_role(name="user", description="General user of app")
    db.session.commit()
    
    # Create admin user if it doesn't exist
    if not app.security.datastore.find_user(email="user0@admin.com"):
        admin_user = app.security.datastore.create_user(
            email="user0@admin.com",
            username="admin01",
            password=hash_password("1234"),
            date_of_birth=datetime.strptime("1980-01-01", '%Y-%m-%d').date(),
            qualification="MBA",
            fullname="KOUSHIK ROY"
        )
        # Assign the 'admin' role to the admin user
        app.security.datastore.add_role_to_user(admin_user, admin_role)
    
    # Create regular user if it doesn't exist
    if not app.security.datastore.find_user(email="user1@user.com"):
        regular_user = app.security.datastore.create_user(
            email="user1@user.com",
            username="user01",
            password=hash_password("1234"),
            date_of_birth=datetime.strptime("2000-01-01", '%Y-%m-%d').date(),
            qualification="H.S",
            fullname="PALASH DEY"
        )
        # Assign the 'user' role to the regular user
        app.security.datastore.add_role_to_user(regular_user, user_role)
    
    # Commit changes to the database
    db.session.commit()

# Import routes
from application.routes import *

# Run the application
if __name__ == "__main__":
    app.run()