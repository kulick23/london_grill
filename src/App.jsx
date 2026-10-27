import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './features/restaurant/Homepage';
import { ExperienceProvider } from './features/restaurant/ExperienceProvider';
import { Frame } from './features/restaurant/components/Shell';
import './App.css';
import './features/restaurant/restaurant.css';
import './features/restaurant/experience.css';
const Reservations = lazy(() => import('./features/restaurant/pages/Reservations'));
const MenuPage = lazy(() => import('./features/restaurant/pages/MenuPage'));
const Evening = lazy(() => import('./features/restaurant/pages/Evening'));
const Admin = lazy(() => import('./features/restaurant/pages/Admin'));
const Stories = lazy(() =>
  import('./features/restaurant/pages/Editorial').then((m) => ({ default: m.Stories })),
);
const Gallery = lazy(() =>
  import('./features/restaurant/pages/Editorial').then((m) => ({ default: m.Gallery })),
);
const AuthPage = lazy(() => import('./features/restaurant/pages/AuthPage'));
function PublicPage({ children }) {
  return (
    <Frame>
      <Suspense fallback={<p role="status">Загрузка…</p>}>{children}</Suspense>
    </Frame>
  );
}
export default function App() {
  return (
    <ExperienceProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/reserve"
          element={
            <PublicPage>
              <Reservations />
            </PublicPage>
          }
        />
        <Route
          path="/menu"
          element={
            <PublicPage>
              <MenuPage />
            </PublicPage>
          }
        />
        <Route
          path="/selection"
          element={
            <PublicPage>
              <MenuPage seasonal />
            </PublicPage>
          }
        />
        <Route
          path="/evening"
          element={
            <PublicPage>
              <Evening />
            </PublicPage>
          }
        />
        <Route path="/orders" element={<Navigate to="/evening" replace />} />
        <Route
          path="/stories"
          element={
            <PublicPage>
              <Stories />
            </PublicPage>
          }
        />
        <Route path="/events" element={<Navigate to="/stories" replace />} />
        <Route
          path="/gallery"
          element={
            <PublicPage>
              <Gallery />
            </PublicPage>
          }
        />
        <Route
          path="/admin"
          element={
            <PublicPage>
              <Admin />
            </PublicPage>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicPage>
              <AuthPage />
            </PublicPage>
          }
        />
        <Route
          path="*"
          element={
            <PublicPage>
              <div className="empty-state">
                <h1>404</h1>
                <p>
                  Страница не найдена. <a href="/">На главную</a>
                </p>
              </div>
            </PublicPage>
          }
        />
      </Routes>
    </ExperienceProvider>
  );
}
