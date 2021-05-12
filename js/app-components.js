//navigation component
//displays nav bar links and sends user to appropriate page component
Vue.component('navigation',     {
    props: {
        authUser: {required: true},
    },
    methods: {
        login(){
            let provider = new firebase.auth.GoogleAuthProvider();

            // login with google
            firebase.auth()
                //.signInWithEmailAndPassword(email, password)
                .signInWithPopup(provider)
                .catch(function(error) {
                    // Handle Errors here.
                    let errorCode = error.code;
                    let errorMessage = error.message;
                });
        },

        logout(){
            firebase.auth().signOut();
        },
    },

    template: `
        <ul class="list-unstyled components">
            <li v-if="authUser">
                <router-link :to="{name: 'home'}">Home</router-link>
            </li>
            <li v-if="authUser">
                <router-link to="/order">Place an Order</router-link>
            </li>
            <li v-if="authUser">
                <router-link to="/history">Order History</router-link>
            </li>
            <li v-if="authUser">
                <router-link to="/kitchen">Kitchen</router-link>
            </li>
            <li v-if="authUser">
                <router-link to="/driver">Driver</router-link>
            </li>
            <li v-if="authUser">
                <a href="#" @click.prevent="logout">Logout</a>
            </li>
            <li v-else>
                <a href="#" @click.prevent="login">Login</a>
            </li>
        </ul>
    `,

});

//routeList component
//used by driver page to display a list of orders to be routed by the map
//has two event methods each triggered by the child routeItem componets
//  removeFromRoute(i) emits event up to driver page to have a specific order i be removed from routeList
//  confirmToRoute(i) emits event  up to driver page that an order is confirmed to be on delivery, and its status needs
//        to be updated.
Vue.component('routeList', {
    props: {
        collection: {type: Array}
    },
    methods: {
        removeFromRoute: function (i) {
            // console.log('huh');
            // console.log('routeList.removeFromRoute('+i.address+')');
            this.$emit('removeFromRoute',i);
        },
        confirmToRoute: function (i) {
            this.$emit('confirmToRoute',i);
        }
    },
    template: `
        <div>
            <h3>Route</h3>
            <b-list-group>
                <routeItem v-for="(route,index) in collection" 
                    :key="index" :item="route" 
                    @removeFromRoute="removeFromRoute" 
                    @confirmToRoute="confirmToRoute">
                </routeItem>
            </b-list-group>
        </div>
    `
});

//routeItem component
//used by routeList to display an orders name and status
// - and + btns that call:
//  removeFromRoute() - send event to routeList that this component's order should be removed from the routeList
//  confirmToRoute() - send event to routeList that this component's order is confirmed to be on delivery
Vue.component('routeItem', {
    props: {
        item: {}
    },
    methods: {
        removeFromRoute: function () {
            // console.log('routeItem.removeFromRoute('+this.item.address+')');
            // console.log('key: '+this.key);
            this.$emit('removeFromRoute',this.item);
        },
        confirmToRoute: function() {
            this.$emit('confirmToRoute',this.item);
        }
    },
    template: `
        <div>

            <b-list-group-item>                
                <b-button @click="removeFromRoute()" variant="danger">-</b-button>
                {{item.address}}
                <b-button @click="confirmToRoute()" variant="success">+</b-button>
            </b-list-group-item>
        </div>
    `
});

//pizzaList component
//displays pizzas for the order page, grabbed from DB
//   addPizza(p) - triggered from child pizza component. send event to order page that this component's pizza shall be added to order
Vue.component('pizzaList', {
    props: {
        collection: {type: String},
        user: {type: Object},
    },
    data: function(){
        return {
            pizzas: null,
        };
    },
    methods: {
        addPizza: function(p) {
            // console.log('pizzaList add::',p);
            this.$emit('addPizza',p);
        }
    },

    firestore: function(){
        //set the component's list type based on collections prop
        //didnt get time to add more types... making this whole switch and the collection prop a waste of CPU
        switch(this.collection){
            // case 'tendies':
            //     return {
            //         pizzas: db.collection('tendies')
            //     };
            // case 'wings':
            //     return {
            //         pizzas: db.collection('wings')
            //     };
            case 'pizzas':
                return {
                    pizzas: db.collection('pizzas')
                }
            default:
                return {
                    pizzas: db.collection('pizzas')
                };
        }
    },

    computed: {  },
    template: `
        <div class="pizza-list">
            <b-row>
            <pizza v-if="pizzas" v-for="p in pizzas" :key="p.id" :pizza="p" @addPizza="addPizza(p)"></pizza>
            <loading v-else></loading>
            </b-row>
        </div>
    `,

});

//pizza component
//displays pizza details for pizzaList component
//  addPizza() - sends event up to parent in order to add this components pizza to the order
Vue.component('pizza',     {
    props: {
        //name: {required: true},
        //price: {required: true},
        pizza: {required: true}
    },
    methods: {
        addPizza: function() {
            // console.log('pizza add   ::');
            this.$emit('addPizza');
        }
    },
    template: `
<!--        <ul class="list-unstyled components">-->
<!--            <li >{{pizza.name}}</li>-->
<!--            <li >{{pizza.price}}</li>-->
<!--            <li> <button @click="addPizza()">add</button></li>-->
<!--        </ul>-->
<!--        -->
    <b-col cols="3">
        <b-card
            img-src="images/pizza.png"
            img-top
            class="mb-2"
            style="max-width: 15rem;"
        >
            <b-card-body>
                <b-card-title>{{pizza.name}}</b-card-title>
                <b-card-text>\${{pizza.price}}</b-card-text>
                <b-button @click="addPizza()">Add to Order</b-button>
            </b-card-body>
        </b-card>
    </b-col>
    `,

});

//kitchen menu component
// displays a list of buttons used in updating orders from the kitchen page
//  updateOrder(status) -sends event up to kitchen page to update and order's status depending on which btn was clicked
Vue.component('kitchenMenu',{
    props: {
        //might not need this
        kitchenItem: {required:true}
    },
    methods: {
        updateOrder: function(status) {
            // console.log('kitchenmenu update("'+status+'")');
            this.$emit('updateOrder',status,this.kitchenItem);
        }
    },
    template: `
        <div>
            <b-button-group>
                <b-button @click="updateOrder('oven')">In Oven</b-button>
                <b-button @click="updateOrder('delivery')">Delivery</b-button>
                <b-button @click="updateOrder('enRoute')">En Route</b-button>
                <b-button @click="updateOrder('complete')">Complete</b-button>
            </b-button-group>
        </div>
    `
});

//driverMenu component
// displays a list of buttons used in creating delivery routes, and updating order status
//  updateOrder(status) sends event to parent driver page to update an orders status to the passed in status
//  addToRoute(o) sends event to parent driver page to add an order to the page's routeList
//  createRoute() sends event to parent driver page to create a route on google maps
//  isEnroute() used to determine an orders status and disable menu btns accordingly
Vue.component('driverMenu',{
    props: {
        //might not need this
        kitchenItem: {required:true}
    },
    methods: {
        updateOrder: function(status) {
            // console.log('driver menu update("'+status+'")');
            this.$emit('updateOrder',status,this.kitchenItem);
        },
        addToRoute: function(o) {
            // console.log('driver menu addToRoute');
            // console.log(o);
            this.$emit('addToRoute',this.kitchenItem);
        },
        createRoute: function() {
            // console.log('driver menu createRoute()');
            this.$emit('createRoute');
        },
        isEnroute: function () {
            return this.kitchenItem.status != 'enRoute';
        }

    },
    template: `
        <div>
            <b-button-group>
                <b-button @click="addToRoute()" :disabled="!isEnroute()">Add to Route</b-button>
                <b-button @click="updateOrder('complete')" :disabled="isEnroute()" variant="success">Complete</b-button>
            </b-button-group>
            <b-button @click="createRoute()">Create Route</b-button>
        </div>
    `
});

//orderList component displays orders of various status', depending on passed in collection prop
//  selectOrder(o) event triggered from child orderItem to go back to parent page that changes which order is currently selected
Vue.component('orderList', {
    props: {
        collection: {type: String},
        user: {type: Object},
        selectedOrder: {type:Object}
    },
    data: function(){
        return {
            orders: null,
            selectedOrderO:0
        };
    },
    methods: {
        // addPizza: function(p) {
        //     console.log('pizzaList add::',p);
        //     this.$emit('addPizza',p);
        // },
        // updateOrder: function(a) {
        //
        // }
        selectOrder: function(o) {
            // console.log('selected order:');
            // console.log(o);
            this.selectedOrderO = o;
            this.$emit('selectOrder',o);
        },
        isActiveOrder: function(o) {
            // console.log('o:');
            // console.log(o);
            // console.log('this.selectedOrder:');
            // console.log(this.selectedOrder);
            if(this.selectedOrder != null && o != null) {
                return (o.id == this.selectedOrder.id);
            } else return false;
        }
    },
    firestore: function(){
        //set the component's list type based on collections prop
        switch(this.collection){
            case 'customer':
                return {
                    orders: db.collection('orders').where('customer', '==', this.user.uid),
                };
            case 'kitchen':
                return {
                    // IN and != not supported in this version of firebase >,<
                    //orders: db.collection("orders").where("status", "in", ["kitchen","oven","delivery"]),
                    //orders: db.collection('orders').where('status', '!=', 'completed'),
                    orders: db.collection('orders').where('status', '==', 'kitchen')
                };
            case 'oven':
                return {
                    orders: db.collection('orders').where('status','==','oven')
                };
            case 'delivery':
                return {
                    orders: db.collection('orders').where('status','==','delivery')
                }
            case 'enRoute':
                return {
                    orders: db.collection('orders').where('status','==','enRoute')
                }
            default:
                return {
                    orders: db.collection('pizzas')
                };
        }
    },
    computed: {  },
    template: `
        <div class="order-list">
            <h3>{{collection}} list</h3>
            <b-list-group>
            <orderDetail v-if="orders" v-for="(o,i) in orders" 
                :key="o.id" 
                :order="o" 
                :isActive2="isActiveOrder(o)" 
                @selectOrder="selectOrder">
            </orderDetail>
            <loading v-else></loading>
            </b-list-group>
        </div>
    `,

});


//orderDetail component displays name,address, and status of orders
// btnClick() sends event up to parent to be used in order selection / tracking which order was clicked
Vue.component('orderDetail',     {
    props: {
        //name: {required: true},
        //price: {required: true},
        order: {required: true},
        isActive2: {required: true}
    },
    data: function () {
        return {
            isSelected: false
        }
    },
    methods: {
        btnClick: function() {
            this.isSelected = !this.isSelected;
            this.$emit('selectOrder',this.order);
        }
    },
    computed: {
        isActive: function() {
            return this.isSelected;
        }
    },
    template: `
       <b-list-group-item :active="isActive2" @click="btnClick()" button>
            <b-row>
                <b-col cols="3">Name: {{order.name}}</b-col>
                <b-col cols="3">Addy: {{order.address}}</b-col>
                <b-col cols="3">Total: {{order.total}}</b-col>
                <b-col cols="3">Status: {{order.status}}</b-col>
            </b-row>                        
       </b-list-group-item>        
    `,
})

//orderDetailItems component displays each pizza in an order, and its price, and a btn to remove it from order
//  removeItemFromOrder()  sends event to parent order page to have this item removed from the current order
Vue.component('orderDetailItems',     {
    props: {
        orderItem: {required: true}
    },
    methods: {
        removeItemFromOrder: function () {
            this.$emit('removeItemFromOrder',this.orderItem);
        }
    },
    template: `
        <ul class="list-unstyled components">
            <li >
                <b-button @click="removeItemFromOrder()" variant="danger">-</b-button>
                {{orderItem.name}}.......\${{orderItem.price}}
            </li>
        </ul>
    `,
});

//cheeky last minute component to show order total on create order page
Vue.component('orderTotal', {
    props: {
        total: {required: true}
    },
    template: `
        <ul class="list-unstyled components">
            <li >
                Total:&nbsp;  \${{total.toFixed(2)}}
            </li>
        </ul>            
    `
});