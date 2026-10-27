import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useExperience, useWords } from '../ExperienceProvider';
import {
  addDays,
  assertBooking,
  endTime,
  FEATURES,
  recommendTables,
  STATUS,
  tableStatus,
  today,
  validSlot,
  validGuest,
} from '../booking/model';
import FloorPlan from '../components/FloorPlan';
import { DemoNote, PageHeading } from '../components/Shell';

export default function Reservations() {
  const { state, change, mode, user } = useExperience();
  const w = useWords();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = params.get('edit');
  const editing = state.bookings.find(
    (b) => b.id === editId && !b.fixture && b.status === 'confirmed',
  );
  const [date, setDate] = useState(
    () => editing?.date || params.get('date') || addDays(today(), 1),
  );
  const [time, setTime] = useState(() => editing?.time || params.get('time') || '19:00');
  const [guests, setGuests] = useState(
    () => editing?.guests || Math.max(1, Math.min(8, Number(params.get('guests')) || 2)),
  );
  const [zone, setZone] = useState('all');
  const [preference, setPreference] = useState('');
  const [selected, setSelected] = useState(editing?.tableId || '');
  const [step, setStep] = useState('table');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [waitlist, setWaitlist] = useState(false);
  const [waitSaved, setWaitSaved] = useState(false);
  const heading = useRef(null);
  const duration = editing?.duration || state.settings.duration;
  const request = { date, time, guests, duration, zone };
  const table = state.tables.find((t) => t.id === selected);
  const available = recommendTables(state.tables, request, state, preference, editing?.id);
  const valid = validSlot(date, time, duration);
  const selectedValid =
    table &&
    tableStatus(table, request, state, editing?.id) === 'available' &&
    (zone === 'all' || table.zone === zone);
  const match = available.find((t) => t.features.includes(preference));
  useEffect(() => {
    if (selected && !selectedValid) {
      setSelected('');
      setStep('table');
    }
  }, [selected, selectedValid]);
  useEffect(() => {
    if (step === 'guest') heading.current?.focus();
  }, [step]);
  const update = (setter, value) => {
    setter(value);
    setSelected('');
    setStep('table');
    setError('');
    setWaitSaved(false);
  };
  useEffect(() => {
    if (selected && window.matchMedia('(max-width: 760px)').matches) {
      heading.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }
  }, [selected]);
  const select = (id) => {
    setSelected(id);
    setError('');
  };
  const zoneName = (id) => {
    const z = state.zones.find((z) => z.id === id);
    return z ? w(z.ru, z.en) : id;
  };
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const input = {
      ...request,
      tableId: selected,
      name: form.get('name').trim(),
      phone: form.get('phone').trim(),
      notes: form.get('notes').trim(),
    };
    try {
      if (mode === 'firebase' && !user) throw new Error('auth-required');
      const id =
        editing?.id ||
        `${mode === 'firebase' ? 'LG' : 'DEMO'}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      await change((s) => {
        if (
          editId &&
          !s.bookings.some((b) => b.id === editId && b.status === 'confirmed' && !b.fixture)
        )
          throw new Error('conflict');
        assertBooking(s, input, editing?.id);
        return {
          ...s,
          bookings: editing
            ? s.bookings.map((b) => (b.id === id ? { ...b, ...input } : b))
            : [
                ...s.bookings,
                { ...input, id, status: 'confirmed', createdAt: new Date().toISOString() },
              ],
          history: [
            ...s.history,
            {
              id: crypto.randomUUID(),
              bookingId: id,
              action: editing ? 'updated' : 'created',
              at: new Date().toISOString(),
            },
          ],
        };
      });
      navigate(`/evening?visit=${id}`);
    } catch (e) {
      setError(
        e.message === 'conflict'
          ? w(
              'Столик уже недоступен. Выберите другой или измените время.',
              'This table is no longer available. Choose another table or time.',
            )
          : e.message === 'auth-required'
            ? w(
                'Войдите в аккаунт, чтобы подтвердить бронирование.',
                'Sign in to confirm this reservation.',
              )
            : e.message === 'guest'
              ? w(
                  'Укажите имя и телефон минимум из 7 цифр.',
                  'Enter your name and a phone number with at least 7 digits.',
                )
              : w(
                  mode === 'firebase'
                    ? 'Не удалось сохранить в Firebase. Повторите попытку.'
                    : 'Не удалось сохранить. Проверьте хранилище браузера и повторите.',
                  mode === 'firebase'
                    ? 'Could not save to Firebase. Try again.'
                    : 'Could not save. Check browser storage and try again.',
                ),
      );
      if (e.message === 'conflict') {
        setSelected('');
        setStep('table');
      }
    } finally {
      setBusy(false);
    }
  }
  async function saveWait(event) {
    event.preventDefault();
    setBusy(true);
    const data = new FormData(event.currentTarget);
    if (!validGuest(data.get('wait-name'), data.get('wait-phone'))) {
      setError(
        w(
          'Укажите имя и телефон минимум из 7 цифр.',
          'Enter your name and at least 7 phone digits.',
        ),
      );
      setBusy(false);
      return;
    }
    try {
      await change((s) => ({
        ...s,
        waitlist: [
          ...s.waitlist,
          {
            id: crypto.randomUUID(),
            ...request,
            name: data.get('wait-name').trim(),
            phone: data.get('wait-phone').trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      setWaitSaved(true);
    } catch {
      setError(w('Не удалось сохранить лист ожидания.', 'Could not save the waiting list.'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title={
          editing
            ? w('Изменить вечер', 'Change your evening')
            : w('Ваш столик ждёт.', 'A table of your own.')
        }
        description={w(
          'Выберите время, найдите своё место и спланируйте вечер.',
          'Choose a time, find your spot and plan an evening.',
        )}
      >
        <Link className="restaurant-text-link" to="/evening">
          {w('Мои визиты', 'My visits')} ↗
        </Link>
      </PageHeading>
      <DemoNote />
      {mode === 'firebase' && !user && (
        <p className="account-prompt">
          <Link className="restaurant-text-link" to="/auth" state={{ from: '/reserve' }}>
            {w('Войти или создать аккаунт', 'Sign in or create an account')} ↗
          </Link>
        </p>
      )}
      {editId && !editing && (
        <p className="form-error" role="alert">
          {w(
            'Этот визит недоступен для изменения. Создайте новый план.',
            'This visit cannot be edited. Create a new visit.',
          )}
        </p>
      )}
      <ol className="booking-steps" aria-label={w('Этапы бронирования', 'Booking steps')}>
        <li aria-current={step === 'table' ? 'step' : undefined}>
          {w('Время и столик', 'Time & table')}
        </li>
        <li aria-current={step === 'guest' ? 'step' : undefined}>
          {w('Данные гостя', 'Guest details')}
        </li>
        <li>{w('Ваш вечер', 'Your evening')}</li>
      </ol>
      <div className="booking-parameters" data-ui>
        <label>
          {w('Дата', 'Date')}
          <input
            name="date"
            type="date"
            min={today()}
            value={date}
            onChange={(e) => {
              update(setDate, e.target.value);
              setParams(
                (p) => {
                  p.set('date', e.target.value);
                  return p;
                },
                { replace: true },
              );
            }}
            required
          />
        </label>
        <label>
          {w('Время', 'Time')}
          <select
            name="time"
            value={time}
            onChange={(e) => {
              update(setTime, e.target.value);
              setParams(
                (p) => {
                  p.set('time', e.target.value);
                  return p;
                },
                { replace: true },
              );
            }}
          >
            {Array.from(
              { length: 21 },
              (_, i) => `${String(12 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
            ).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          {w('Гостей', 'Guests')}
          <select
            name="guests"
            value={guests}
            onChange={(e) => {
              update(setGuests, Number(e.target.value));
              setParams(
                (p) => {
                  p.set('guests', e.target.value);
                  return p;
                },
                { replace: true },
              );
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          {w('Зона', 'Area')}
          <select name="zone" value={zone} onChange={(e) => update(setZone, e.target.value)}>
            <option value="all">{w('Все зоны', 'All areas')}</option>
            {state.zones.map((z) => (
              <option key={z.id} value={z.id}>
                {w(z.ru, z.en)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!valid && (
        <p className="form-error" role="status">
          {w(
            'Выберите будущее время между 12:00 и 23:00 с учётом длительности визита.',
            'Choose a future time between 12:00 and 23:00, allowing for the visit duration.',
          )}
        </p>
      )}
      {state.settings.closedDates.includes(date) && (
        <p className="form-error" role="status">
          {w(
            mode === 'firebase'
              ? 'На эту дату приём гостей закрыт.'
              : 'На эту дату приём гостей закрыт в демо-настройках.',
            mode === 'firebase'
              ? 'Reservations are closed on this date.'
              : 'This date is closed in demo settings.',
          )}
        </p>
      )}
      <div className="booking-workspace" data-ui>
        <div>
          <FloorPlan
            state={state}
            request={request}
            selected={selected}
            onSelect={select}
            recommended={preference ? match?.id : undefined}
            ignoreId={editing?.id}
          />
          <details className="table-list">
            <summary>
              {w('Список столиков', 'Table list')} · {available.length} {w('доступно', 'available')}
            </summary>
            <div>
              {state.tables
                .filter((t) => zone === 'all' || t.zone === zone)
                .map((t) => {
                  const status = tableStatus(t, request, state, editing?.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={selected === t.id}
                      disabled={status !== 'available'}
                      onClick={() => select(t.id)}
                    >
                      <span>
                        {w('Стол', 'Table')} {t.number} · {zoneName(t.zone)}
                      </span>
                      <span>
                        {t.capacity} {w('мест', 'seats')} ·{' '}
                        {t.capacity < guests ? w('Мало мест', 'Too small') : w(...STATUS[status])}
                      </span>
                    </button>
                  );
                })}
            </div>
          </details>
        </div>
        <aside className="booking-aside">
          <div className="table-finder">
            <h2>{w('Найдите своё место', 'Find your perfect table')}</h2>
            <label>
              {w('Что важно для вечера?', 'What matters tonight?')}
              <select
                name="preference"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
              >
                <option value="">{w('Без предпочтений', 'No preference')}</option>
                {Object.entries(FEATURES).map(([id, names]) => (
                  <option value={id} key={id}>
                    {w(...names)}
                  </option>
                ))}
              </select>
            </label>
            {preference && (
              <p>
                {match
                  ? w(
                      `Подойдёт стол ${match.number}: ${w(...FEATURES[preference])}.`,
                      `Table ${match.number} matches: ${w(...FEATURES[preference])}.`,
                    )
                  : w(
                      'Нет доступного столика с этим свойством. Попробуйте другое время.',
                      'No available table matches. Try another time.',
                    )}
              </p>
            )}
            {match && preference && (
              <button
                type="button"
                className="restaurant-text-link"
                onClick={() => select(match.id)}
              >
                {w(`Выбрать стол ${match.number}`, `Choose table ${match.number}`)} ↗
              </button>
            )}
          </div>
          <div className="selected-table">
            <h2 tabIndex="-1" ref={heading}>
              {table && selectedValid
                ? w(`Стол ${table.number}`, `Table ${table.number}`)
                : w('Выберите столик', 'Choose a table')}
            </h2>
            {table && selectedValid ? (
              <>
                <p>
                  {zoneName(table.zone)} · {table.capacity} {w('мест', 'seats')}
                </p>
                <p>{table.features.map((f) => w(...FEATURES[f])).join(' · ')}</p>
                <dl className="visit-facts">
                  <div>
                    <dt>{w('Дата', 'Date')}</dt>
                    <dd>{date}</dd>
                  </div>
                  <div>
                    <dt>{w('Время', 'Time')}</dt>
                    <dd>
                      {time} — {endTime(time, duration)}
                    </dd>
                  </div>
                  <div>
                    <dt>{w('Гостей', 'Guests')}</dt>
                    <dd>{guests}</dd>
                  </div>
                </dl>
                {step === 'table' && (
                  <button
                    type="button"
                    className="restaurant-button"
                    onClick={() => setStep('guest')}
                  >
                    {w('Перейти к данным', 'Enter guest details')} ↗
                  </button>
                )}
              </>
            ) : (
              <p>
                {w(
                  'Нажмите на свободный столик на схеме или в списке.',
                  'Choose an available table on the plan or in the list.',
                )}
              </p>
            )}
          </div>
          {step === 'guest' && selectedValid && (
            <form className="guest-form" onSubmit={submit}>
              <label>
                {w('Ваше имя', 'Your name')}
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength="80"
                  defaultValue={editing?.name || ''}
                />
              </label>
              <label>
                {w('Телефон', 'Phone')}
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  minLength="7"
                  maxLength="24"
                  pattern={String.raw`[+0-9\s\(\)\-]{7,24}`}
                  defaultValue={editing?.phone || ''}
                />
              </label>
              <label>
                {w('Пожелания', 'Special requests')}
                <textarea
                  name="notes"
                  maxLength="500"
                  rows="3"
                  defaultValue={editing?.notes || ''}
                />
              </label>
              <p className="small-note">
                {w(
                  mode === 'firebase'
                    ? 'Имя и телефон защищены вашим аккаунтом Firebase. Визит можно отменить в любой момент.'
                    : 'Имя и телефон сохраняются только в браузере. В любой момент можно отменить визит.',
                  mode === 'firebase'
                    ? 'Your name and phone are protected by your Firebase account. You can cancel at any time.'
                    : 'Name and phone stay in this browser. You can cancel your visit at any time.',
                )}
              </p>
              <button className="restaurant-button" type="submit" disabled={busy}>
                {busy
                  ? w('Сохраняем…', 'Saving…')
                  : w(
                      editing
                        ? 'Сохранить изменения'
                        : mode === 'firebase'
                          ? 'Сохранить бронь'
                          : 'Сохранить демо-бронь',
                      editing
                        ? 'Save changes'
                        : mode === 'firebase'
                          ? 'Save reservation'
                          : 'Save demo reservation',
                    )}
              </button>
            </form>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {!available.length && (
            <p role="status">
              {w(
                mode === 'firebase'
                  ? 'Подходящих столиков нет. Измените время или оставьте заявку в листе ожидания.'
                  : 'Подходящих столиков нет. Измените время или оставьте демо-заявку в листе ожидания.',
                mode === 'firebase'
                  ? 'No suitable tables. Try another time or join the waiting list.'
                  : 'No suitable tables. Try another time or join the demo waiting list.',
              )}
            </p>
          )}
          <button
            type="button"
            className="restaurant-text-link"
            aria-expanded={waitlist}
            onClick={() => setWaitlist(!waitlist)}
          >
            {w('Лист ожидания', 'Waiting list')} {waitlist ? '−' : '+'}
          </button>
          {waitlist &&
            (waitSaved ? (
              <p role="status">
                {w(
                  mode === 'firebase'
                    ? 'Заявка сохранена в Firebase. Уведомления от ресторана пока не отправляются.'
                    : 'Демо-заявка сохранена в браузере. Уведомления от ресторана не отправляются.',
                  mode === 'firebase'
                    ? 'Request saved in Firebase. Restaurant notifications are not enabled yet.'
                    : 'Demo request saved in this browser. No restaurant notifications will be sent.',
                )}
              </p>
            ) : (
              <form className="guest-form" onSubmit={saveWait}>
                <p>
                  {date} · {time} · {guests} {w('гостей', 'guests')}
                </p>
                <label>
                  {w('Имя для листа ожидания', 'Waiting list name')}
                  <input name="wait-name" autoComplete="name" required maxLength="80" />
                </label>
                <label>
                  {w('Телефон для листа ожидания', 'Waiting list phone')}
                  <input
                    name="wait-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    pattern={String.raw`[+0-9\s\(\)\-]{7,24}`}
                  />
                </label>
                <button
                  className="restaurant-button"
                  disabled={busy || !valid || state.settings.closedDates.includes(date)}
                >
                  {w(
                    mode === 'firebase' ? 'Сохранить заявку' : 'Сохранить демо-заявку',
                    mode === 'firebase' ? 'Save request' : 'Save demo request',
                  )}
                </button>
              </form>
            ))}
        </aside>
      </div>
    </>
  );
}
