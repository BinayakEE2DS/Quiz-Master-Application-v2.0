// Import all Vue components from the pages folder
import Home from '../pages/home.js';
import Login from '../pages/login.js';
import Register from '../pages/register.js';
import AdminDashboard from '../pages/adminDashboard.js';
import AdminQuizManagement from '../pages/adminQuizManagement.js';
import AdminSummaryCharts from '../pages/adminSummaryCharts.js';
import AdminSearch from '../pages/adminSearch.js';
import CreateNewChapter from '../pages/createNewChapter.js';
import EditChapter from '../pages/editChapter.js';
import CreateNewSubject from '../pages/createNewSubject.js';
import CreateNewQuestion from '../pages/createNewQuestion.js';
import EditQuestion from '../pages/editQuestion.js';
import CreateNewQuiz from '../pages/createNewQuiz.js';
import QuizInformation from '../pages/quizInformation.js';
import UserDashboard from '../pages/userDashboard.js';
import UserQuizInformation from '../pages/userQuizInformation.js';
import UserSearch from '../pages/userSearch.js';
import UserScores from '../pages/userScores.js';
import UserSummaryCharts from '../pages/userSummaryCharts.js';
import StartQuiz from '../pages/startQuiz.js';

// Define the routes for the application
const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/quiz_management', component: AdminQuizManagement, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/create_new_subject', component: CreateNewSubject, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/create_new_chapter/:subject_id', component: CreateNewChapter, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/edit_chapter/:chapter_id', component: EditChapter, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/create_new_quiz', component: CreateNewQuiz, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/create_new_question/:quiz_id', component: CreateNewQuestion, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/edit_question/:question_id', component: EditQuestion, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/quiz_information/:quiz_id', component: QuizInformation, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin_search', component: AdminSearch, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin_summary_charts', component: AdminSummaryCharts, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/user_dashboard', component: UserDashboard, meta: { requiresAuth: true, requiresUser: true } },
    { path: '/user_quiz_information/:quiz_id', component: UserQuizInformation, meta: { requiresAuth: true, requiresUser: true } },
    { path: '/start_quiz/:quiz_id/:question_id', component: StartQuiz, meta: { requiresAuth: true, requiresUser: true } },
    { path: '/user_scores', component: UserScores, meta: { requiresAuth: true, requiresUser: true } },
    { path: '/user_search', component: UserSearch, meta: { requiresAuth: true, requiresUser: true } },
    { path: '/user_summary_charts', component: UserSummaryCharts, meta: { requiresAuth: true, requiresUser: true } },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

// Navigation guard for authentication and role-based access
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('auth-token');
    const userRoles = JSON.parse(localStorage.getItem('roles'));

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.meta.requiresAdmin && !userRoles?.includes('admin')) {
        next('/');
    } else if (to.meta.requiresUser && !userRoles?.includes('user')) {
        next('/');
    } else {
        next();
    }
});

export default router;
