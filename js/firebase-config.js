const firebaseConfig = {
    apiKey: "AIzaSyDR3K5jO54QuX9-bid_u95uqLrWZRMeE8E",
    authDomain: "storyweave-f01d8.firebaseapp.com",
    databaseURL: "https://storyweave-f01d8-default-rtdb.firebaseio.com",
    projectId: "storyweave-f01d8",
    storageBucket: "storyweave-f01d8.firebasestorage.app",
    messagingSenderId: "327667402396",
    appId: "1:327667402396:web:5b301186bdd673f8bd0f59"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();