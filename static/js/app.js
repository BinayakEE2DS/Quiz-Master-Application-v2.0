import router from "./utils/router.js";

new Vue({
    el: '#app',
    template: `
        <div>
            <router-view></router-view>
        </div>
    `,
    router,
});


