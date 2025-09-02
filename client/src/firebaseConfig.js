import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
 };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export storage
export const storage = getStorage(app);
