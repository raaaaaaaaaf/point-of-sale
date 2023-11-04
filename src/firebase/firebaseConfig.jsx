// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1U7VpnU_jcQHilZvZ7NYTS9DFFsYJvZI",
  authDomain: "point-of-sale-69ba6.firebaseapp.com",
  projectId: "point-of-sale-69ba6",
  storageBucket: "point-of-sale-69ba6.appspot.com",
  messagingSenderId: "610031891458",
  appId: "1:610031891458:web:19e84236d0217feadb631b",
  measurementId: "G-7VBG1JG3DX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)