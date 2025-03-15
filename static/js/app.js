import router from "./utils/router.js";
// import Home from "./pages/home.js";
new Vue({
    el: '#app',
    template: `
        <div>
            <router-view></router-view>
        </div>
    `,
    router,
});


