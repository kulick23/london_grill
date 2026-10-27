import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nProvider';
import { useExperience, useWords } from '../ExperienceProvider';
export function RestaurantHeader() {
  const { language, setLanguage } = useI18n();
  const w = useWords();
  const { state, mode, user, signOut } = useExperience();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    document.documentElement.lang = language === 'en' ? 'en' : 'ru';
  }, [location.pathname, language]);
  const items = [
    ['/menu', w('Меню', 'Menu')],
    ['/reserve', w('Выбрать стол', 'Find a table')],
    ['/stories', w('Истории', 'Stories')],
    ['/evening', w('Мой вечер', 'My evening')],
  ];
  return (
    <header className="restaurant-header experience-header">
      <Link to="/" className="restaurant-logo" translate="no">
        LG<span>London Grill</span>
      </Link>
      <button
        className="mobile-nav-toggle"
        aria-expanded={open}
        aria-controls="experience-nav"
        onClick={() => setOpen(!open)}
      >
        {w('Разделы', 'Explore')} {open ? '−' : '+'}
      </button>
      <nav
        id="experience-nav"
        className={open ? 'is-open' : ''}
        aria-label={w('Основная навигация', 'Main navigation')}
      >
        {items.map(([to, label]) => (
          <NavLink key={to} to={to}>
            {label}
            {to === '/evening' && state.cart.length > 0 ? (
              <span className="nav-count">{state.cart.reduce((n, i) => n + i.quantity, 0)}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      <button
        className="restaurant-language"
        onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
        aria-label={language === 'en' ? 'Переключить на русский' : 'Switch to English'}
      >
        {language === 'en' ? 'RU' : 'EN'}
      </button>
      {mode === 'firebase' ? (
        user ? (
          <button className="restaurant-account" onClick={signOut}>
            {w('Выйти', 'Sign out')}
          </button>
        ) : (
          <Link className="restaurant-account" to="/auth">
            {w('Войти', 'Sign in')}
          </Link>
        )
      ) : null}
    </header>
  );
}
export function RestaurantFooter() {
  const w = useWords();
  const { mode } = useExperience();
  return (
    <footer className="experience-footer">
      <Link to="/" translate="no">
        London Grill
      </Link>
      <div>
        <Link to="/gallery">{w('Галерея', 'Gallery')}</Link>
        <Link to="/selection">{w('Сезонный стол', 'Seasonal table')}</Link>
        <Link to="/admin">
          {mode === 'firebase'
            ? w('Управление', 'Workspace')
            : w('Демо-управление', 'Demo workspace')}
        </Link>
      </div>
      <p>
        {w(
          mode === 'firebase'
            ? 'Бронирования защищены аккаунтом и сохраняются в Firebase.'
            : 'Портфолио-проект. Бронирования и заказы сохраняются только в этом браузере.',
          mode === 'firebase'
            ? 'Reservations are protected by your account and saved in Firebase.'
            : 'Portfolio project. Reservations and orders are saved only in this browser.',
        )}
      </p>
    </footer>
  );
}
export function DemoNote() {
  const w = useWords();
  const { mode, user } = useExperience();
  return (
    <p className="demo-note">
      {mode === 'firebase'
        ? user
          ? w('Firebase подключён · данные синхронизируются', 'Firebase connected · data is synced')
          : w('Войдите, чтобы сохранить бронирование', 'Sign in to save a reservation')
        : w(
            'Демонстрационный режим · без отправки в ресторан и оплаты',
            'Demo mode · no restaurant submission or payment',
          )}
    </p>
  );
}
export function PageHeading({ title, description, children }) {
  return (
    <div className="experience-title">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Frame({ children }) {
  const w = useWords();
  const { error, mode } = useExperience();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className={`restaurant-home experience experience-${pathname.split('/')[1] || 'home'}`}>
      <a className="restaurant-skip" href="#experience-main">
        {w('Перейти к содержанию', 'Skip to content')}
      </a>
      <RestaurantHeader />
      <main id="experience-main" className="experience-main">
        {error && (
          <p className="form-error" role="alert">
            {w(
              mode === 'firebase'
                ? 'Не удалось синхронизировать данные с Firebase. Изменения не подтверждены.'
                : 'Не удалось прочитать или сохранить данные браузера. Проверьте доступ к хранилищу; изменения не подтверждены.',
              mode === 'firebase'
                ? 'Firebase data could not be synced. Changes have not been confirmed.'
                : 'Browser data could not be read or saved. Check storage permissions; changes have not been confirmed.',
            )}
          </p>
        )}
        {children}
      </main>
      <RestaurantFooter />
    </div>
  );
}
