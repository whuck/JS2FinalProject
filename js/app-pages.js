const HomePage = Vue.component('HomePage', {
    props: {
        authUser: {required: true},
    },

    template: `
        <div class="home page">
            <div class="text-center">
                <b-img src="images/logo.png" responsive class="logo" alt="Logo"></b-img>
                <h1>Waukesha County Technical College</h1>
                <h3>Artisan Pizza</h3>
            </div>
        </div>
    `,
});

//order page, displays form to create an order, and a list of pizzas to be added
const OrderPage = Vue.component('OrderPage', {
    props: {
        authUser: {required: true},
    },
    data: function () {
        return {
            newOrder: new Order(),
            autoComplete: {}
        }
    },
    computed: {
        loggedIn() {
            return (this.authUser && this.authUser.uid);
        },
    },
    methods: {
        //creates orderobject from component's newOrder var
        //stuffs in db
        addOrder() {
            let theOrder = this.newOrder;
            theOrder.customer = this.authUser.uid;
            theOrder.status = "kitchen";
            // theOrder.total = this.calcTotal();
            // console.log('hmmmm:');
            // console.log(this.autocomplete.getPlace().formatted_address);

            //the google autocomplete messes with the v-model connection to the address <input>
            //not enough time to resolve
            theOrder.address = document.getElementById('address').value;
            db.collection('orders')
                .add(theOrder)
                .then(function(docRef) {
                    console.log("Document written:", docRef);
                    // clear order
                    theOrder = new Order();
                    router.push({name:'history'});
                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });
        },
        //adds item p to order
        addItemToOrder(p) {
            // console.log('additemtoOrder',p);
            this.newOrder.orderItems.push({"name":p.name,"price":p.price});
        },
        //removes item i from order
        // removeItemFromOrder(i) {
        //     this.newOrder.orderItems.splice(i,1);
        // },
        removeItemFromOrder: function(i) {
            // console.log('removeFromOrder('+i+')');
            this.newOrder.orderItems.splice(this.newOrder.orderItems.indexOf(i),1);
        },
        calcTotal: function() {
            let total = 0;

            for (let i = 0; i < this.newOrder.orderItems.length; i++) {
                total+= this.newOrder.orderItems[i].price;
            }
            // console.log('order total: '+total);
            this.newOrder.total = total.toFixed(2);
            return total;
        },
        //loads googlemaps autocomplete into address input
        loadAutocomplete: function() {
            const center = { lat: 43.071, lng: -88.254 };
            // Create a bounding box with sides ~20km away from the center point
            const defaultBounds = {
                north: center.lat + 0.2,
                south: center.lat - 0.2,
                east: center.lng + 0.2,
                west: center.lng - 0.2,
            };
            const input = document.getElementById("address");
            //console.log(input);
            const options = {
                bounds: defaultBounds,
                componentRestrictions: { country: "us" },
                fields: ["address_components", "name"],
                origin: center,
                strictBounds: true,
                types: ["address"],
            };
            this.autocomplete = new google.maps.places.Autocomplete(input, options);
        }
    },
    mounted: function() {
        //messy I know
        setTimeout(this.loadAutocomplete,1000);
    },
    template: `
        <div class="order page">
            <div>
                <h2>Create Order</h2>

                <pizza-list collection="pizzas" v-if="loggedIn" :user="authUser" @addPizza="addItemToOrder"></pizza-list>
                            
                <b-form v-if="loggedIn" @submit.prevent="addOrder">
                
                    <b-form-group label="Name" label-for="name" class="col-md-12">
                        <b-form-input id="name" v-model="newOrder.name" required></b-form-input>
                    </b-form-group>
                    
                    <b-form-group label="Address" label-for="address" class="col-md-12">
                        <b-form-input id="address" v-model="newOrder.address" required></b-form-input>
                    </b-form-group>
                    
                    <h3>Order Details</h3>
                    
                    <orderDetailItems v-if="newOrder" v-for="o,i in newOrder.orderItems" :key="i" :orderItem="o" @removeItemFromOrder="removeItemFromOrder"></orderDetailItems>
                    <div>
                        <orderTotal v-if="newOrder.orderItems" :total="calcTotal()"></orderTotal>
                    </div>
                    <div class="col-md-12">
                        <b-button v-if="newOrder.orderItems.length>0"type="submit" variant="primary">Submit</b-button>
                    </div>
                </b-form>
                <b-col v-else cols="9" class="mx-auto">
                    <b-alert variant="danger" class="mt-5 w-100" show>You must be logged in to make an order</b-alert>
                </b-col>
            </div>
        </div>
    `,
});

//history page
//displays all of a users orders, of all status
const HistoryPage = Vue.component('HistoryPage', {
    props: {
        authUser: {required: true},
    },
    computed: {
        loggedIn() {
            return (this.authUser && this.authUser.uid);
        },
    },
    template: `
        <div class="order page">
            <div class="text-center">
                <h2>history page</h2>
            </div>             
            <div>            
                <order-list collection="customer" v-if="loggedIn" :user="authUser"></order-list>
            </div>
        </div>
    `,
});

//kitchen page component in charge of
//- displaying all non-complete orders
//- changing status of all orders
const KitchenPage = Vue.component('KitchenPage', {
    props: {
        authUser: {required: true},
    },
    computed: {
        loggedIn() {
            return (this.authUser && this.authUser.uid);
        },
        orderSelected() {
            return (this.selectedOrder != null);
        }
    },

    //selectedOrder pointer is used to determine which order to update status
    data: function() {
        return {
            selectedOrder: null
        }
    },
    methods: {
        //changes selected order to o
        selectOrder: function(o) {
            // console.log('kitchen page selected Order');
            // console.log(o);
            this.selectedOrder = o;
        },

        //updates order o to have status s
        updateOrder: function(s,o) {
            // console.log('kitchen page update order');
            // console.log('status: '+s);
            // console.log('order: '+o.name);
            // console.log(o);
            db.collection("orders").doc(o.id).update({status: s})
                .then(function(docRef) {
                    console.log("Document written:", docRef);
                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });
        }
    },
    template: `
        <div class="order page">
            <div class="text-center">
                <h1>Kitchen page</h1>
            </div>
            <div>
                <kitchen-menu v-if="orderSelected" :kitchenItem=selectedOrder @updateOrder="updateOrder"></kitchen-menu>
                <order-list collection="kitchen" v-if="loggedIn" :user="authUser" :selectedOrder="selectedOrder" @selectOrder="selectOrder"></order-list>
                <order-list collection="oven" v-if="loggedIn" :user="authUser" :selectedOrder="selectedOrder" @selectOrder="selectOrder"></order-list>
                <order-list collection="delivery" v-if="loggedIn" :user="authUser" :selectedOrder="selectedOrder" @selectOrder="selectOrder"></order-list>
                <order-list collection="enRoute" v-if="loggedIn" :user="authUser" :selectedOrder="selectedOrder" @selectOrder="selectOrder"></order-list>
            </div>
        </div>
    `,
});

//driver page component, in charge of:
//- displaying orders that are ready to be delivered,
//- routing orders onto a google map
//- updating order status accordingly
const DriverPage = Vue.component('DriverPage', {
    props: {
        authUser: {required: true},
    },
    computed: {
        loggedIn() {
            return (this.authUser && this.authUser.uid);
        },
        orderSelected() {
            return (this.selectedOrder != null);
        }
    },
    //selectedOrder pointer is used to determine which order to either update status or send to be routed on the map
    //routeList is array of addresses to be used by the map
    //homebase is the address of the pizza shop
    data: function() {
        return {
            selectedOrder: null,
            routeList: [],
            homeBase: "800 Main St, Pewaukee, WI 53072"
        }
    },
    mounted: function() {
        this.routeList=[];
    },
    methods: {
        //changes selected order to o
        selectOrder: function(o) {
            // console.log('driver page selected Order');
            // console.log(o);
            this.selectedOrder = o;
        },
        // updateOrder: function(s,o) {
        //     console.log('driver page update order');
        //     console.log('status: '+s);
        //     console.log('order: '+o.name);
        //     console.log(o);
        //
        //     db.collection("orders").doc(o.id).update({status: s})
        //         .then(function(docRef) {
        //             console.log("Document written:", docRef);
        //
        //             // clear potluck
        //             selectedOrder = null
        //
        //             // redirect to that potluck
        //             //router.push({ name: 'potluck', params: { id: docRef.id } })
        //
        //         })
        //         .catch(function(error) {
        //             console.error("Error adding document: ", error);
        //         });
        // },
        //begins map creation, probably superfluous
        createRoute: function() {
            console.log('driver page create route');
            this.initMap();
        },

        //adds order o to routelist
        addToRoute: function(o) {
            // console.log('driver page addToRoute('+o.address+')');
            this.routeList.push(o);
        },

        //removes order o from routelist
        removeFromRoute: function(o) {
            // console.log('driver page removeFromRoute('+o.address+')');
            this.routeList.splice(this.routeList.indexOf(o),1);
        },

        //makes waypoint array from selected orders
        //fires up google maps, displays optimized route from homebase, out to each waypoint, then back to homebase
        initMap: function() {
            //init googlemaps
            let map;
            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 43.071, lng: -88.254 },
                zoom: 30,
                minZoom:10
            });

            //init waypoint array.... validation be damned
            let wps = [];
            for (let i = 0; i < this.routeList.length; i++) {
                wps.push(   {
                    location:this.routeList[i].address,
                    stopover: true
                });
            }

           // console.log('waypoints[]'+rl.length);
           //  console.log(wps);
            //init map
            let directionsService = new google.maps.DirectionsService();
            let directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
            let directionsReq = {
                origin: this.homeBase,
                destination: this.homeBase,
                waypoints: wps,
                optimizeWaypoints: true,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.IMPERIAL
            };
            //draws route on map
            directionsService.route(directionsReq, function(result,status) {
                if (status =='OK') {
                    console.log('directions Received');
                    console.log(result);
                    result.geocoded_waypoints[0] = null;
                    directionsRenderer.setDirections(result);
                } else {
                    console.log('map routing died somehow');
                }
            });
        },

        //updates order o to have status s
        updateOrder: function(s,o) {
            // console.log('driver page update order');
            // console.log('status: '+s);
            // console.log('order: '+o.name);
            // console.log(o);
            db.collection("orders").doc(o.id).update({status: s})
                .then(function(docRef) {
                    console.log("Document written:", docRef);
                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });
        },

        //updates order status in db, removes it from routelist array
        confirmToRoute: function(o) {
            this.updateOrder('enRoute',o);
            this.removeFromRoute(o);
        }

    },
    mounted: function(){},
    template: `
        <div class="driver page">
            <div class="text-center">
                <h1>Driver Routing Page</h1>
            </div>
            <div>
                <driver-menu v-if="orderSelected" :kitchenItem=selectedOrder @updateOrder="updateOrder" @createRoute="createRoute" @addToRoute="addToRoute"></driver-menu>
                <order-list collection="delivery" v-if="loggedIn" :user="authUser" :selectedOrder="selectedOrder" @selectOrder="selectOrder"></order-list>
                <order-list collection="enRoute" v-if="loggedIn" :user="authUser" :selectedOrder="selectedOrder" @selectOrder="selectOrder"></order-list>
            </div>
            <div>
                <route-list :collection="routeList" @removeFromRoute="removeFromRoute" @confirmToRoute="confirmToRoute"></route-list>
            </div>
            <div id="map" style="width:100%;height:600px;"></div>   
        </div>
    `,
});