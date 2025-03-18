// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getStorage, ref, uploadBytes, getDownloadURL, getBytes } from 'firebase/storage';
import {getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, setDoc, deleteDoc} from 'firebase/firestore';
import {getAuth} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClD99SofwQMibLOGlk54sb90uEtGu7aLg",
  authDomain: "seguridadsalud-60b15.firebaseapp.com",
  projectId: "seguridadsalud-60b15",
  storageBucket: "seguridadsalud-60b15.firebasestorage.app",
  messagingSenderId: "949087928723",
  appId: "1:949087928723:web:89b1eaea333f20794fe866",
  measurementId: "G-7JTSNMKV5V"
};



export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);