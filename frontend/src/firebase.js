import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJGmTiFc8kekbX-JSqeT9zqlskNv1ywAY",
  authDomain: "cancer-analysis-522ef.firebaseapp.com",
  projectId: "cancer-analysis-522ef",
  storageBucket: "cancer-analysis-522ef.firebasestorage.app",
  messagingSenderId: "647793360976",
  appId: "1:647793360976:web:f975641241c356bca85155"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
