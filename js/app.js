// Include Firebase plugin
Vue.use(Vuefire);

//router
const router = new VueRouter({
    routes: [
        {path: '/', component: HomePage },
        {name: 'home', path: '/home', component: HomePage},
        {name: 'order', path: '/order', component: OrderPage},
        {name: 'history', path: '/history', component: HistoryPage},
        {name: 'kitchen', path: '/kitchen', component: KitchenPage},
        {name: 'driver',path:'/driver',component:DriverPage}
    ]
});

// Initialize App
const app = new Vue({
    // el: the DOM element to be replaced with a Vue instance
    el: '#app',
    router: router,
    // data: all the data for the app
    data: {
        authUser: null,
    },
    // methods: usually "events" triggered by v-on:
    methods: { },

    // computed: values that are updated and cached if dependencies change
    computed: { },

    // called after the instance has been created,
    created: function() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                // let displayName = user.displayName;
                // let email = user.email;
                // let emailVerified = user.emailVerified;
                // let photoURL = user.photoURL;
                // let isAnonymous = user.isAnonymous;
                // let uid = user.uid;
                // let providerData = user.providerData;

                // console.log('Signed in as: ', user);
                // console.log('user.uid:',user.uid);
                // store the logged in user in our app
                this.authUser = new User(user);
            } else {
                // User is signed out.
                console.log('Not signed in.');

                // remove the current user
                this.authUser = null;
            }
        });
    },

    // watch: calls the function if the value changes
    watch: { }
});

