import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nProvider';
import { useExperience, useWords } from '../ExperienceProvider';
import { catalog, getItem, money } from '../data/catalog';
import { endTime, ORDER_STATUS, today } from '../booking/model';
import { DemoNote, PageHeading } from '../components/Shell';
export default function Evening() {
  const { state, change, mode } = useExperience();
  const w = useWords();
  const { language } = useI18n();
  const [params, setParams] = useSearchParams();
  const [notice, setNotice] = useState('');
  const [cancelId, setCancelId] = useState('');
  const [busy, setBusy] = useState(false);
  const bookings = state.bookings
    .filter((b) => !b.fixture)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const selected = bookings.find((b) => b.id === params.get('visit')) || bookings[0];
  const table = state.tables.find((t) => t.id === selected?.tableId);
  const zone = state.zones.find((z) => z.id === table?.zone);
  const cart = state.cart
    .map((row) => {
      const item = catalog.find((i) => i.id === row.id);
      return item ? { ...getItem(item, state), quantity: row.quantity } : null;
    })
    .filter(Boolean);
  const total = cart.reduce((n, i) => n + i.price * i.quantity, 0);
  const editable = selected?.status === 'confirmed' && selected.date >= today();
  const canEditVisit =
    editable && ['none', 'pending', 'rejected', 'cancelled'].includes(selected?.orderStatus || 'none');
  const canSubmitOrder =
    editable && ['none', 'pending', 'rejected', 'cancelled'].includes(selected?.orderStatus || 'none');
  async function commit(fn, message) {
    setBusy(true);
    try {
      await change(fn);
      setNotice(message);
    } catch {
      setNotice(
        w('Не удалось сохранить изменения. Повторите.', 'Could not save changes. Try again.'),
      );
    } finally {
      setBusy(false);
    }
  }
  const quantity = (id, delta) =>
    commit(
      (s) => ({
        ...s,
        cart: s.cart
          .map((i) => (i.id === id ? { ...i, quantity: Math.min(20, i.quantity + delta) } : i))
          .filter((i) => i.quantity > 0),
      }),
      '',
    );
  const cancel = () =>
    commit(
      (s) => ({
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === cancelId
            ? {
                ...b,
                status: 'cancelled',
                orderStatus: b.preorder?.length ? 'cancelled' : 'none',
              }
            : b,
        ),
        history: [
          ...s.history,
          {
            id: crypto.randomUUID(),
            bookingId: cancelId,
            action: 'cancelled',
            at: new Date().toISOString(),
          },
        ],
      }),
      w(
        mode === 'firebase'
          ? 'Бронь отменена. Столик снова доступен.'
          : 'Демо-бронь отменена. Столик снова доступен.',
        mode === 'firebase'
          ? 'Reservation cancelled. The table is available again.'
          : 'Demo reservation cancelled. The table is available again.',
      ),
    ).then(() => setCancelId(''));
  return (
    <>
      <PageHeading
        title={w('Ваш вечер.', 'Your evening.')}
        description={w(
          'Место, компания и блюда к вашему приходу. Всё в одном плане.',
          'Your table, your company and food for your arrival. One plan.',
        )}
      >
        <Link className="restaurant-button" to="/reserve">
          {w('Выбрать столик', 'Find a table')} ↗
        </Link>
      </PageHeading>
      <DemoNote />
      <div className="evening-layout">
        <section className="visit-panel" data-ui>
          <h2>{w('Планы на вечер', 'Evening plans')}</h2>
          {bookings.length ? (
            <>
              <label className="visit-picker">
                {w('Ваши визиты', 'Your visits')}
                <select
                  value={selected?.id || ''}
                  onChange={(e) => setParams({ visit: e.target.value })}
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.date} · {b.time} ·{' '}
                      {b.status === 'cancelled' ? w('Отменён', 'Cancelled') : b.id}
                    </option>
                  ))}
                </select>
              </label>
              <div className="visit-ticket">
                <p className="small-note">
                  {selected.status === 'cancelled'
                    ? w(
                        mode === 'firebase' ? 'Отменённый визит' : 'Отменённый демо-визит',
                        mode === 'firebase' ? 'Cancelled visit' : 'Cancelled demo visit',
                      )
                    : w(
                        mode === 'firebase' ? 'Подтверждённый визит' : 'Сохранённый демо-визит',
                        mode === 'firebase' ? 'Confirmed visit' : 'Saved demo visit',
                      )}{' '}
                  · {selected.id}
                </p>
                <h3>
                  {table
                    ? w(`Стол ${table.number}`, `Table ${table.number}`)
                    : w('Стол удалён', 'Table removed')}
                </h3>
                <p>{zone ? w(zone.ru, zone.en) : '—'}</p>
                <dl className="visit-facts">
                  <div>
                    <dt>{w('Дата', 'Date')}</dt>
                    <dd>
                      {new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(`${selected.date}T12:00:00`))}
                    </dd>
                  </div>
                  <div>
                    <dt>{w('Время', 'Time')}</dt>
                    <dd>
                      {selected.time} — {endTime(selected.time, selected.duration)}
                    </dd>
                  </div>
                  <div>
                    <dt>{w('Гостей', 'Guests')}</dt>
                    <dd>{selected.guests}</dd>
                  </div>
                  <div>
                    <dt>{w('Гость', 'Guest')}</dt>
                    <dd>{selected.name}</dd>
                  </div>
                  <div>
                    <dt>{w('Телефон', 'Phone')}</dt>
                    <dd>{selected.phone}</dd>
                  </div>
                  {selected.notes && (
                    <div>
                      <dt>{w('Пожелания', 'Requests')}</dt>
                      <dd>{selected.notes}</dd>
                    </div>
                  )}
                </dl>
                {mode === 'demo' && (
                  <p className="small-note">
                    {w(
                      'Это локальная демонстрация, а не подтверждение от ресторана. Адрес и контакты пока не предоставлены.',
                      'This is a local demonstration, not confirmation from the restaurant. Address and contact details have not been provided.',
                    )}
                  </p>
                )}
                {editable && (
                  <div className="visit-actions">
                    {canEditVisit && (
                      <Link className="restaurant-text-link" to={`/reserve?edit=${selected.id}`}>
                        {w('Изменить визит', 'Edit visit')} ↗
                      </Link>
                    )}
                    <button
                      className="restaurant-text-link"
                      onClick={() => setCancelId(selected.id)}
                    >
                      {w('Отменить бронь', 'Cancel reservation')} ×
                    </button>
                  </div>
                )}
                {cancelId === selected.id && (
                  <div
                    className="confirm-action"
                    role="group"
                    aria-label={w('Подтверждение отмены', 'Confirm cancellation')}
                  >
                    <p>
                      {w(
                        mode === 'firebase'
                          ? 'Отменить этот визит? Столик освободится.'
                          : 'Отменить этот демо-визит? Столик освободится.',
                        mode === 'firebase'
                          ? 'Cancel this visit? The table will become available.'
                          : 'Cancel this demo visit? The table will become available.',
                      )}
                    </p>
                    <button className="restaurant-button" disabled={busy} onClick={cancel}>
                      {w('Да, отменить', 'Yes, cancel')}
                    </button>
                    <button className="restaurant-text-link" onClick={() => setCancelId('')}>
                      {w('Сохранить визит', 'Keep visit')}
                    </button>
                  </div>
                )}
                {selected.preorder?.length > 0 && (
                  <div className="saved-preorder">
                    <div className="saved-preorder-heading">
                      <h3>{w('Заказ к визиту', 'Order for your visit')}</h3>
                      <span className={`order-status status-${selected.orderStatus || 'pending'}`}>
                        {w(...ORDER_STATUS[selected.orderStatus || 'pending'])}
                      </span>
                    </div>
                    {selected.preorder.map((i) => (
                      <p key={i.id}>
                        {i.name} × {i.quantity} <span>{money(i.price * i.quantity, language)}</span>
                      </p>
                    ))}
                    <p>
                      {w('Демо-итог', 'Demo total')}:{' '}
                      {money(
                        selected.preorder.reduce((n, i) => n + i.price * i.quantity, 0),
                        language,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>
                {w(
                  'Пока нет визитов. Начните с выбора столика — это займёт пару минут.',
                  'No visits yet. Start by choosing a table.',
                )}
              </p>
              <Link className="restaurant-text-link" to="/reserve">
                {w('Выбрать своё место', 'Find your spot')} ↗
              </Link>
            </div>
          )}
          {state.waitlist.length > 0 && (
            <details className="waitlist-records">
              <summary>
                {w('Лист ожидания', 'Waiting list')} · {state.waitlist.length}
              </summary>
              {state.waitlist.map((row) => (
                <div key={row.id}>
                  <p>
                    {row.date} · {row.time} · {row.guests} {w('гостей', 'guests')}
                  </p>
                  <button
                    className="restaurant-text-link"
                    onClick={() =>
                      commit(
                        (s) => ({ ...s, waitlist: s.waitlist.filter((i) => i.id !== row.id) }),
                        w('Заявка удалена.', 'Request removed.'),
                      )
                    }
                  >
                    {w(
                      mode === 'firebase' ? 'Удалить заявку' : 'Удалить демо-заявку',
                      mode === 'firebase' ? 'Remove request' : 'Remove demo request',
                    )}{' '}
                    ×
                  </button>
                </div>
              ))}
            </details>
          )}
        </section>
        <section className="preorder-panel" data-ui>
          <h2>{w('К вашему столу', 'For your table')}</h2>
          <p className="small-note">
            {w(
              mode === 'firebase'
                ? 'Цены в BYN. Заказ отправится сотруднику на подтверждение; оплата в приложении не производится.'
                : 'Демо-цены в BYN. Заказ появится в локальной панели администратора; оплата не производится.',
              mode === 'firebase'
                ? 'Prices in BYN. The order will be sent to staff for confirmation; no in-app payment is taken.'
                : 'Demo prices in BYN. The order will appear in the local admin panel; no payment is taken.',
            )}
          </p>
          {cart.length ? (
            <>
              <ul className="cart-list">
                {cart.map((i) => (
                  <li key={i.id}>
                    <img src={i.image} width="90" height="80" alt="" />
                    <div>
                      <h3>{w(i.nameRu, i.nameEn)}</h3>
                      <p>{money(i.price, language)}</p>
                      <div className="quantity-control">
                        <button
                          disabled={busy}
                          aria-label={w(`Уменьшить: ${i.nameRu}`, `Decrease ${i.nameEn}`)}
                          onClick={() => quantity(i.id, -1)}
                        >
                          −
                        </button>
                        <output aria-label={w('Количество', 'Quantity')}>{i.quantity}</output>
                        <button
                          disabled={busy || i.quantity >= 20}
                          aria-label={w(`Увеличить: ${i.nameRu}`, `Increase ${i.nameEn}`)}
                          onClick={() => quantity(i.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span>{money(i.price * i.quantity, language)}</span>
                  </li>
                ))}
              </ul>
              <div className="cart-total">
                <span>{w('Демонстрационный итог', 'Demo total')}</span>
                <strong>{money(total, language)}</strong>
              </div>
              {canSubmitOrder ? (
                <button
                  className="restaurant-button"
                  disabled={busy}
                  onClick={() =>
                    commit(
                      (s) => ({
                        ...s,
                        bookings: s.bookings.map((b) =>
                          b.id === selected.id
                            ? {
                                ...b,
                                preorder: cart.map((i) => ({
                                  id: i.id,
                                  name: w(i.nameRu, i.nameEn),
                                  quantity: i.quantity,
                                  price: i.price,
                                })),
                                orderStatus: 'pending',
                              }
                            : b,
                        ),
                      }),
                      w(
                        mode === 'firebase'
                          ? 'Заказ отправлен. Статус появится здесь после подтверждения сотрудником.'
                          : 'Демо-заказ отправлен в локальную панель администратора.',
                        mode === 'firebase'
                          ? 'Order sent. Its status will update here after staff confirmation.'
                          : 'Demo order sent to the local admin panel.',
                      ),
                    )
                  }
                >
                  {w(
                    selected?.orderStatus === 'pending' ? 'Обновить заказ' : 'Отправить заказ',
                    selected?.orderStatus === 'pending' ? 'Update order' : 'Submit order',
                  )}{' '}
                  ↗
                </button>
              ) : editable && selected?.preorder?.length ? (
                <p className="small-note" role="status">
                  {w(
                    'Заказ уже принят в работу. Изменения доступны после обращения к сотруднику.',
                    'This order is already in progress. Ask a staff member if it needs changing.',
                  )}
                </p>
              ) : (
                <Link className="restaurant-text-link" to="/reserve">
                  {w(
                    'Выберите столик, чтобы связать предзаказ',
                    'Choose a table to attach your pre-order',
                  )}{' '}
                  ↗
                </Link>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>
                {w(
                  'Выберите блюда в меню и соберите свой стол.',
                  'Pick your dishes and put together a table.',
                )}
              </p>
            </div>
          )}
          <Link className="restaurant-text-link" to="/menu">
            {w('Открыть меню', 'Explore the menu')} ↗
          </Link>
        </section>
      </div>
      <p role="status" className="action-notice">
        {notice}
      </p>
    </>
  );
}
