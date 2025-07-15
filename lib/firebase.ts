import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDoi0bZNWKdHVV-bKDRiJZt8RgO4g1UYbE",
  authDomain: "fiscal-b142f.firebaseapp.com",
  projectId: "fiscal-b142f",
  storageBucket: "fiscal-b142f.firebasestorage.app",
  messagingSenderId: "924680638239",
  appId: "1:924680638239:web:cf135d830e439192f06a2a",
  measurementId: "G-08JY1SC0ZQ"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
