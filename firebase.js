// Configuración única de Firebase: todas las páginas importan app, db y auth desde aquí
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

export const firebaseConfig = {
    apiKey: "AIzaSyDnEejftP3iYoTSAzYvDSdwHdYTEUIV8s4",
    authDomain: "proyecto-integrador-77c49.firebaseapp.com",
    projectId: "proyecto-integrador-77c49",
    storageBucket: "proyecto-integrador-77c49.firebasestorage.app",
    messagingSenderId: "1074040277954",
    appId: "1:1074040277954:web:26167a594d0c8159d6245b"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
