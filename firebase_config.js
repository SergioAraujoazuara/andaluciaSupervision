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
  apiKey: "AIzaSyBvcnuHKizCTa1DfmzJBwemOcHA9FRNeiI",
  authDomain: "inspeccionadif-65654.firebaseapp.com",
  projectId: "inspeccionadif-65654",
  storageBucket: "inspeccionadif-65654.appspot.com",
  messagingSenderId: "202357095294",
  appId: "1:202357095294:web:fea94a376cdf11a524d12f",
  measurementId: "G-KNCMF4SS16"
};



export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);