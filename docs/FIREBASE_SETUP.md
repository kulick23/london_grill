# Firebase setup — `projectbar-d23d5`

Код интеграции подключён к Firebase Authentication и Cloud Firestore Standard edition. Web config проекта сохранён локально в `.env.local`. Email/Password Authentication включён; база `(default)` создана в `europe-central2`. Firestore Rules и indexes опубликованы. Hosting deployment не выполнялся.

## 1. Включить продукты в Firebase Console

1. Authentication → Sign-in method → включить **Email/Password**.
2. Firestore Database → Create database → выбрать **Standard edition** и регион, ближайший к ресторану и основной аудитории. Database ID должен оставаться `(default)`.
3. Project settings → General → Web app `Bar` → SDK setup and configuration → скопировать значения `firebaseConfig` в `.env.local`:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=projectbar-d23d5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=projectbar-d23d5
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_ID=(default)
VITE_USE_FIREBASE_EMULATORS=false
```

Firebase web config не является серверным секретом, но `.env.local` исключён из git, чтобы разные окружения не смешивались.

## 2. Подготовить первого администратора

1. Зарегистрировать сотрудника через `/auth`.
2. Открыть Authentication → Users и скопировать его UID.
3. В Firestore Console вручную создать документ `admins/{UID}` с полем `enabled: true`.

Клиент не может создавать или изменять `admins`: Rules разрешают только чтение собственного маркера. Позже этот шаг можно автоматизировать доверенной Cloud Function или Admin SDK. Custom claim `admin: true` также поддерживается.

## 3. Локальная проверка

```bash
npm ci
npm run dev
npm test
```

Для Rules-тестов нужен Java 21 и Firestore Emulator:

```bash
npm run test:rules
```

При `VITE_USE_FIREBASE_EMULATORS=true` клиент использует Auth Emulator `127.0.0.1:9099` и Firestore Emulator `127.0.0.1:8080`.

## 4. Deployment после проверки

```bash
npx firebase login
npx firebase use projectbar-d23d5
npx firebase deploy --only firestore:rules,firestore:indexes
```

Эти команды здесь не запускались: deployment должен выполняться только после проверки проекта, региона, тестов Rules и явного решения владельца.

## Модель данных

- `users/{uid}/bookings/{bookingId}` — приватные контакты, пожелания и предзаказ гостя.
- `availability/{bookingId}` — обезличенный интервал занятости для realtime-карты.
- `reservationSlots/{date_table_time}` — 30-минутные атомарные блокировки от двойной брони.
- `users/{uid}/cart`, `favorites`, `waitlist` — личные данные пользователя.
- `restaurant/config` — столы, зоны, настройки и изменения меню; запись только администратору.
- `admins/{uid}` — доверенный серверный маркер роли; клиентская запись запрещена.

Создание, редактирование и отмена брони меняют private booking, availability и все slot claims в одной Firestore transaction.
