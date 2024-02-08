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
    apiKey: "AIzaSyBJi9qrrsaaaxCnyhPQ2HhxO2qSJkwaJZ4",
    authDomain: "inspeccion-454e4.firebaseapp.com",
    projectId: "inspeccion-454e4",
    storageBucket: "inspeccion-454e4.appspot.com",
    messagingSenderId: "1036900171846",
    appId: "1:1036900171846:web:9be632ca76bcc380c40a47",
    measurementId: "G-WBGQ7GL9LS"
  };

// Initialize Firebase



export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);