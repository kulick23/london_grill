import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../../firebase';
import { useExperience, useWords } from '../ExperienceProvider';
import { PageHeading } from '../components/Shell';

const messages = {
  'auth/email-already-in-use': [
    'Этот email уже зарегистрирован.',
    'This email is already registered.',
  ],
  'auth/invalid-credential': ['Неверный email или пароль.', 'Incorrect email or password.'],
  'auth/weak-password': [
    'Пароль должен содержать минимум 6 символов.',
    'Use at least 6 characters.',
  ],
  'auth/invalid-email': ['Проверьте адрес email.', 'Check the email address.'],
  'auth/too-many-requests': [
    'Слишком много попыток. Попробуйте позже.',
    'Too many attempts. Try later.',
  ],
};

export default function AuthPage() {
  const w = useWords();
  const { user, mode, loading } = useExperience();
  const location = useLocation();
  const [register, setRegister] = useState(
    () => new URLSearchParams(location.search).get('mode') === 'register',
  );
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const destination = location.state?.from || '/evening';
  if (!loading && user) return <Navigate to={destination} replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const data = new FormData(event.currentTarget);
    try {
      if (register) {
        await createUserWithEmailAndPassword(auth, data.get('email'), data.get('password'));
      } else {
        await signInWithEmailAndPassword(auth, data.get('email'), data.get('password'));
      }
    } catch (error) {
      const pair = messages[error.code];
      setNotice(
        pair ? w(...pair) : w('Не удалось войти. Повторите.', 'Could not sign in. Try again.'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function reset(event) {
    const email = event.currentTarget.form.elements.email.value;
    if (!email) {
      setNotice(w('Сначала укажите email.', 'Enter your email first.'));
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice(w('Письмо для сброса пароля отправлено.', 'Password reset email sent.'));
    } catch {
      setNotice(w('Не удалось отправить письмо.', 'Could not send the email.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeading
        title={
          register
            ? w('Создать аккаунт.', 'Create an account.')
            : w('Ваш вечер — здесь.', 'Your evening, saved.')
        }
        description={w(
          'Аккаунт защищает ваши бронирования и предзаказы.',
          'Your account keeps reservations and pre-orders private.',
        )}
      />
      {mode !== 'firebase' ? (
        <div className="empty-state">
          <p>
            {w(
              'Firebase пока не настроен. Сайт работает в локальном демо-режиме.',
              'Firebase is not configured yet. The site is running in local demo mode.',
            )}
          </p>
          <Link className="restaurant-text-link" to="/reserve">
            {w('Вернуться к бронированию', 'Back to reservations')} ↗
          </Link>
        </div>
      ) : (
        <form className="auth-sheet" onSubmit={submit}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            {w('Пароль', 'Password')}
            <input
              name="password"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              minLength="6"
              required
            />
          </label>
          {notice && (
            <p role="status" className="form-error">
              {notice}
            </p>
          )}
          <button className="restaurant-button" disabled={busy}>
            {register ? w('Создать аккаунт', 'Create account') : w('Войти', 'Sign in')}
          </button>
          <button
            type="button"
            className="restaurant-text-link"
            onClick={() => {
              setRegister(!register);
              setNotice('');
            }}
          >
            {register
              ? w('Уже есть аккаунт? Войти', 'Already registered? Sign in')
              : w('Нет аккаунта? Создать', 'New here? Create an account')}
          </button>
          {!register && (
            <button type="button" className="restaurant-text-link" disabled={busy} onClick={reset}>
              {w('Забыли пароль?', 'Forgot password?')}
            </button>
          )}
        </form>
      )}
    </>
  );
}
