// ===== Firebase 初始化 =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBumXE566u2VBXF0dXf3Fm-5-EnKIJukYo",
    authDomain: "english-game-f2b13.firebaseapp.com",
    databaseURL: "https://english-game-f2b13-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "english-game-f2b13",
    storageBucket: "english-game-f2b13.firebasestorage.app",
    messagingSenderId: "19292210103",
    appId: "1:19292210103:web:441b5e52093753e1055e32",
    measurementId: "G-2Y3CQYEH5Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Re-export auth functions
export { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser };
// Re-export firestore functions
export { doc, getDoc, setDoc, updateDoc, deleteDoc };
