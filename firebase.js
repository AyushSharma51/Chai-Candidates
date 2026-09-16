import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    doc,
    deleteDoc
} from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyB9JFyad26cn4zGsHccKoEeNde1nZinnH4",
    authDomain: "chai-candidates.firebaseapp.com",
    projectId: "chai-candidates",
    storageBucket: "chai-candidates.firebasestorage.app",
    messagingSenderId: "995533243767",
    appId: "1:995533243767:web:8dec855e97853cd829cd72"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


export {
    db,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    doc,
    deleteDoc
};