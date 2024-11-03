// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAfGmqOViFESamu15ixWGXgc7oYGt2DyfQ",
    authDomain: "bm-ims-phase-i.firebaseapp.com",
    projectId: "bm-ims-phase-i",
    storageBucket: "bm-ims-phase-i.appspot.com",
    messagingSenderId: "536222985169",
    appId: "1:536222985169:web:10596dd214068c1d5b0ef0",
    measurementId: "G-SJ47G7SJ52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
