# The app "Prasnottari -Quiz Master Apllication - v2.0" is using SQLite for database,Flask for API,    VUE-CDN,VueJS for UI,Bootstrap for HTML generation and styling,Redis for caching,Redis and Celery for batch jobs.The application will have only one admin identified by its role I will use Flask security (token) for Token based authentication to implement role-based access control.The app must have a suitable model to store and differentiate all types of users.


# The required processes to start the application Quiz-Master-Application-v2.0
# Working on in WSL terminal in VS CODE
1. Install python -> sudo apt install python3.12-venv
2. Create virtual environment for the application -> python3 -m venv .env
3. Activate environment -> source .env/bin/activate
4. In case the environment(.env) is corrupted/lost/deleted to install it at a go->pip install -r requirements.txt
5. We are using Bootstrap CSS Framework ,Vue_Router & Vue-CDN Links directly integrated inside      index.html file.
6. Router.js file contains all the frontend vue components imported from the frontend javascript pages inside pages folder. App.js imports all the vue components from router.js file hence runs the frontend routes.
7. app.py file runs the application
8. To run the application follow the following steps:
    (a) Activate the virtual environment -> source .env/bin/activate
    (b) Run the app.py file -> python3 app.py