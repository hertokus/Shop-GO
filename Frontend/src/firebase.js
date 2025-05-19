// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// BURAYA kendi firebaseConfig verini yapıştır:
const firebaseConfig = {
  apiKey: "AIzaSyAIcEvMPfdM5rsnez92XN4mKqu-N1IgCzw",
  authDomain: "shop-go-1e22e.firebaseapp.com",
  projectId: "shop-go-1e22e",
  storageBucket: "shop-go-1e22e.firebasestorage.app",
  messagingSenderId: "317834741960",
  appId: "1:317834741960:web:a665e291b93beb34847dfd",
  measurementId: "G-LPK6YWBZLP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
