import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAwxQjhEBfqE6Pn9mNoGqtJU7a8bM7L6UE',
  authDomain: 'projectbar-d23d5.firebaseapp.com',
  projectId: 'projectbar-d23d5',
  storageBucket: 'projectbar-d23d5.firebasestorage.app',
  messagingSenderId: '982920727907',
  appId: '1:982920727907:web:3f7fec9afd3f2449c05756',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
