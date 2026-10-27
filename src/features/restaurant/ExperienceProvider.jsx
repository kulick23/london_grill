import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useI18n } from '../../i18n/I18nProvider';
import { auth, configured } from '../../firebase';
import { mutateState, readState, STORAGE_KEY } from './data/storage';
import { isFirebaseAdmin, mutateFirestoreState, subscribeFirestoreState } from './data/firestore';
import { seedState } from './booking/model';
const Context = createContext(null);
export function ExperienceProvider({ children }) {
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [state, setState] = useState(() => {
    try {
      return readState();
    } catch {
      return seedState();
    }
  });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    if (configured) {
      let unsubscribeData = () => {};
      const unsubscribeAuth = onAuthStateChanged(auth, async (nextUser) => {
        unsubscribeData();
        setUser(nextUser);
        setError('');
        if (!nextUser) {
          setIsAdmin(false);
          setState({
            ...seedState(),
            bookings: [],
            cart: [],
            favorites: [],
            waitlist: [],
            history: [],
          });
          setLoading(false);
          return;
        }
        try {
          const token = await nextUser.getIdTokenResult();
          const admin = token.claims.admin === true || (await isFirebaseAdmin(nextUser.uid));
          setIsAdmin(admin);
          unsubscribeData = subscribeFirestoreState(
            nextUser,
            admin,
            (next) => {
              setState(next);
              setLoading(false);
            },
            () => {
              setError('firebase');
              setLoading(false);
            },
          );
        } catch {
          setError('firebase');
          setLoading(false);
        }
      });
      return () => {
        unsubscribeData();
        unsubscribeAuth();
      };
    }
    try {
      readState();
    } catch {
      setError('storage');
    }
    const update = (event) => {
      if (event.key === STORAGE_KEY) {
        try {
          setState(readState());
        } catch {
          setError('storage');
        }
      }
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  async function change(fn) {
    try {
      const next = configured
        ? await mutateFirestoreState(user, stateRef.current, fn, isAdmin)
        : await mutateState(fn);
      setState(next);
      setError('');
      return next;
    } catch (e) {
      if (!['conflict', 'guest', 'layout', 'auth-required', 'forbidden'].includes(e.message))
        setError(configured ? 'firebase' : 'storage');
      throw e;
    }
  }
  const signOut = () => (auth ? firebaseSignOut(auth) : Promise.resolve());
  return (
    <Context.Provider
      value={{
        state,
        change,
        error,
        mode: configured ? 'firebase' : 'demo',
        user,
        isAdmin,
        loading,
        signOut,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useExperience() {
  return useContext(Context);
}
export function useWords() {
  const { language } = useI18n();
  return (ru, en) => (language === 'en' ? en : ru);
}
