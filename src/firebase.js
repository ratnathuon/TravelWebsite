import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

// TODO: Replace this with your actual Firebase configuration!
// 1. Go to https://console.firebase.google.com/ and create a project.
// 2. Click the Web icon (</>) to register a web app.
// 3. Copy the configuration they give you and paste it below.
// 4. In Firebase Console, go to Authentication -> Sign-in method and enable "Email/Password" and "Google".
const firebaseConfig = {
  apiKey: "AIzaSyCDHv_X4o2MVXjzhAFPKJi3q9my__YBla8",
  authDomain: "travel-cambodia.firebaseapp.com",
  projectId: "travel-cambodia",
  storageBucket: "travel-cambodia.firebasestorage.app",
  messagingSenderId: "663707695228",
  appId: "1:663707695228:web:5f0035293e03697a34b1f9",
  measurementId: "G-FL1PM0BRW3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
};
