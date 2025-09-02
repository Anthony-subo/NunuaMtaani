import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2FsFm3381tK5W9e0Go3idb8VtEzngsTY",
  authDomain: "project-8ac25.firebaseapp.com",
  databaseURL: "https://project-8ac25-default-rtdb.firebaseio.com",
  projectId: "project-8ac25",
  storageBucket: "project-8ac25.appspot.com", // ✅ correct bucket
  messagingSenderId: "622149030138",
  appId: "1:622149030138:web:571686dc65367c508c7943"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export storage
export const storage = getStorage(app);
