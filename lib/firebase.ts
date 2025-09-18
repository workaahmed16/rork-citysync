import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA9BDOLfahp25eQYsep7y2js8KDZJMMbzw",
  authDomain: "citysync-rork.firebaseapp.com",
  projectId: "citysync-rork",
  storageBucket: "citysync-rork.firebasestorage.app",
  messagingSenderId: "390441307981",
  appId: "1:390441307981:ios:e87189af4deb8f70e8b104"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;