// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage'; // Si usarás storage

const firebaseConfig = {

  apiKey: "AIzaSyB-TXOCHxwkUCPixae83xKI5aQmHJAx3F8",

  authDomain: "empleosenecuador-ca06e.firebaseapp.com",

  projectId: "empleosenecuador-ca06e",

  storageBucket: "empleosenecuador-ca06e.firebasestorage.app",

  messagingSenderId: "21659915743",

  appId: "1:21659915743:web:a86e5b7d070a5230e6206a",

  measurementId: "G-4C14P1JVMC"

};





// Solo inicializar una vez
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// export const storage = getStorage(app); // si usarás Firebase Storage
