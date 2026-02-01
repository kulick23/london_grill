import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../Toast/ToastProvider';

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t } = useI18n();
  const { showToast } = useToast();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/orders');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>{isRegister ? t('auth.register') : t('auth.login')}</h2>
      <form onSubmit={handleAuth} className={styles.form}>
        <input
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          {isRegister ? t('auth.register') : t('auth.login')}
        </button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} className={styles.toggleButton}>
        {isRegister ? t('auth.toggleToLogin') : t('auth.toggleToRegister')}
      </button>
    </div>
  );
};

export default Auth;
