// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove, get, push } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOj7wX2VznoBVzIvto2yzL7ZFVldQN1zE",
    authDomain: "hukum-c3925.firebaseapp.com",
    databaseURL: "https://hukum-c3925-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hukum-c3925",
    storageBucket: "hukum-c3925.appspot.com",
    messagingSenderId: "217599773757",
    appId: "1:217599773757:web:8842b2aaf647326ae36e54",
    measurementId: "G-8ZRD9P57H6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };

