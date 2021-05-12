// Models
const User = function(firebaseUser){
    let m = {
        displayName: '',
        email: '',
        photoURL: '',
        uid: '',
    }

    if(firebaseUser){
        m.displayName = firebaseUser.displayName ? firebaseUser.displayName : '';
        m.email = firebaseUser.email ? firebaseUser.email : '';
        m.photoURL = firebaseUser.photoURL ? firebaseUser.photoURL : '';
        m.uid = firebaseUser.uid ? firebaseUser.uid : '';
    }

    return m;
}

const Order = function() {
    return {
        address:'',
        customer:'',
        orderItems:[],
        status:'',
        datetime: new Date(),
    }
}

// -----------------------------------------------------

// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyD6yA1orCFCdVj1B8Pf1p9IWORs-ivJpYk",
    authDomain: "js2finalproject.firebaseapp.com",
    projectId: "js2finalproject",
    storageBucket: "js2finalproject.appspot.com",
    messagingSenderId: "506336088021",
    appId: "1:506336088021:web:b38a219301bf1cf70b775c"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


