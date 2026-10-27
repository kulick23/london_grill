import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useExperience, useWords } from '../ExperienceProvider';
import { catalog, categories, getItem, money } from '../data/catalog';
import { assertBooking, endTime, today, FEATURES, ORDER_STATUS } from '../booking/model';
import { PageHeading } from '../components/Shell';

const ORDER_ACTIONS = {
  pending: [
    ['accepted', 'Принять', 'Accept'],
    ['rejected', 'Отклонить', 'Reject'],
  ],
  accepted: [
    ['preparing', 'Начать готовить', 'Start preparing'],
    ['rejected', 'Отклонить', 'Reject'],
  ],
  preparing: [['ready', 'Заказ готов', 'Mark ready']],
  ready: [['completed', 'Завершить', 'Complete']],
};

export default function Admin() {
  const { state, change, mode, user, isAdmin, loading } = useExperience();
  const w = useWords();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'orders';
  const [notice, setNotice] = useState('');
  const [tableId, setTableId] = useState('t1');
  const [dishId, setDishId] = useState(catalog[0].id);
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState(today());
  const [search, setSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('active');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('all');
  const table = state.tables.find((t) => t.id === tableId);
  const dish = getItem(
    catalog.find((i) => i.id === dishId),
    state,
  );
  const list = state.bookings.filter(
    (b) =>
      (!search || `${b.name} ${b.phone} ${b.id}`.toLowerCase().includes(search.toLowerCase())) &&
      b.date === date,
  );
  const orders = state.bookings
    .filter((booking) => !booking.fixture && booking.preorder?.length)
    .filter((booking) =>
      orderFilter === 'active'
        ? !['completed', 'rejected', 'cancelled'].includes(booking.orderStatus)
        : orderFilter === 'all' || booking.orderStatus === orderFilter,
    )
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const visibleMenuItems = catalog.filter((item) => {
    const current = getItem(item, state);
    return (
      (menuCategory === 'all' || item.category === menuCategory) &&
      (!menuSearch ||
        `${current.nameRu} ${current.nameEn}`.toLowerCase().includes(menuSearch.toLowerCase()))
    );
  });
  if (mode === 'firebase' && loading) {
    return <p role="status">{w('Проверяем доступ…', 'Checking access…')}</p>;
  }
  if (mode === 'firebase' && !loading && (!user || !isAdmin)) {
    return (
      <>
        <PageHeading
          title={w('Доступ ограничен.', 'Restricted access.')}
          description={w(
            'Эта панель доступна только сотрудникам с ролью администратора.',
            'This workspace is only available to users with the administrator role.',
          )}
        />
        <p className="demo-note">
          {user
            ? w(
                'Ваш аккаунт не имеет роли администратора.',
                'Your account is not an administrator.',
              )
            : w('Сначала войдите в аккаунт сотрудника.', 'Sign in with a staff account first.')}
        </p>
      </>
    );
  }
  async function save(fn, message) {
    setBusy(true);
    try {
      await change(fn);
      setNotice(
        message ||
          w(
            mode === 'firebase'
              ? 'Изменения сохранены в Firebase.'
              : 'Изменения сохранены в браузере.',
            mode === 'firebase' ? 'Changes saved in Firebase.' : 'Changes saved in this browser.',
          ),
      );
      setConfirm('');
    } catch (e) {
      setNotice(
        e.message === 'layout'
          ? w(
              'Столики пересекаются. Измените координаты.',
              'Tables overlap. Adjust the coordinates.',
            )
          : e.message === 'conflict'
            ? w(
                'Конфликт: столик недоступен в этот интервал.',
                'Conflict: table unavailable for this interval.',
              )
            : w(
                mode === 'firebase'
                  ? 'Изменения не сохранены. Проверьте данные и доступ к Firebase.'
                  : 'Изменения не сохранены. Проверьте данные и доступ к хранилищу.',
                mode === 'firebase'
                  ? 'Changes were not saved. Check the data and Firebase access.'
                  : 'Changes were not saved. Check input and browser storage.',
              ),
      );
    } finally {
      setBusy(false);
    }
  }
  function saveTable(event) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const next = {
      ...table,
      capacity: Number(f.get('capacity')),
      zone: f.get('zone'),
      x: Number(f.get('x')),
      y: Number(f.get('y')),
      shape: f.get('shape'),
      blocked: f.get('blocked') === 'on',
      features: Object.keys(FEATURES).filter((id) => f.get(`feature-${id}`) === 'on'),
      occupiedUntil: f.get('occupied') === 'on' ? Date.now() + 45 * 60000 : undefined,
    };
    save((s) => {
      if (
        s.bookings.some(
          (b) =>
            b.tableId === next.id &&
            b.status === 'confirmed' &&
            b.date >= today() &&
            b.guests > next.capacity,
        )
      )
        throw new Error('conflict');
      if (
        s.tables.some(
          (t) => t.id !== next.id && Math.abs(t.x - next.x) < 125 && Math.abs(t.y - next.y) < 115,
        )
      )
        throw new Error('layout');
      return { ...s, tables: s.tables.map((t) => (t.id === next.id ? next : t)) };
    });
  }
  function setOrderStatus(bookingId, orderStatus) {
    save(
      (s) => ({
        ...s,
        bookings: s.bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, orderStatus } : booking,
        ),
        history: [
          ...s.history,
          {
            id: crypto.randomUUID(),
            bookingId,
            action: `order:${orderStatus}`,
            at: new Date().toISOString(),
          },
        ],
      }),
      w('Статус заказа обновлён.', 'Order status updated.'),
    );
  }
  function toggleMenuItem(item) {
    const current = getItem(item, state);
    save(
      (s) => ({
        ...s,
        menuOverrides: {
          ...s.menuOverrides,
          [item.id]: {
            nameRu: current.nameRu,
            nameEn: current.nameEn,
            price: current.price,
            hidden: !current.hidden,
          },
        },
      }),
      current.hidden
        ? w('Позиция снова видна в меню.', 'Item is visible in the menu again.')
        : w('Позиция скрыта из меню.', 'Item hidden from the menu.'),
    );
  }
  return (
    <>
      <PageHeading
        title={w('Рабочая смена.', 'The service desk.')}
        description={w(
          mode === 'firebase'
            ? 'Управление бронированиями, залом и меню.'
            : 'Локальная демонстрация управления рестораном.',
          mode === 'firebase'
            ? 'Manage reservations, floor plan and menu.'
            : 'Local demonstration of restaurant management.',
        )}
      />
      <p className="demo-note">
        {w(
          mode === 'firebase'
            ? 'Защищённая панель Firebase. Действия синхронизируются с Firestore.'
            : 'Открытая sandbox-панель. Это не защищённая админка: она меняет только демонстрационные данные вашего браузера.',
          mode === 'firebase'
            ? 'Protected Firebase workspace. Changes are synced to Firestore.'
            : 'Open sandbox workspace. This is not a secured admin: it only changes demo data in your browser.',
        )}
      </p>
      <div className="admin-workspace" data-ui>
        <nav
          className="admin-nav"
          aria-label={w('Разделы управления', 'Management sections')}
        >
          {[
            ['orders', 'Заказы', 'Orders'],
            ['bookings', 'Бронирования', 'Reservations'],
            ['tables', 'Столики и зоны', 'Tables & areas'],
            ['menu', 'Меню', 'Menu'],
            ['settings', 'Настройки', 'Settings'],
          ].map(([id, ru, en]) => (
            <button
              key={id}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => {
                setParams({ tab: id });
                setNotice('');
              }}
            >
              {w(ru, en)}
            </button>
          ))}
        </nav>
        <div className="admin-sheet">
          {tab === 'orders' && (
            <>
              <div className="admin-section-heading">
                <div>
                  <p className="admin-kicker">{w('Живая очередь', 'Live queue')}</p>
                  <h2>{w('Заказы к бронированиям', 'Orders for reservations')}</h2>
                </div>
                <div className="order-metrics" aria-label={w('Сводка заказов', 'Order summary')}>
                  <span>
                    <strong>
                      {
                        state.bookings.filter(
                          (booking) => booking.orderStatus === 'pending',
                        ).length
                      }
                    </strong>
                    {w('новых', 'new')}
                  </span>
                  <span>
                    <strong>
                      {
                        state.bookings.filter(
                          (booking) => booking.orderStatus === 'preparing',
                        ).length
                      }
                    </strong>
                    {w('готовятся', 'preparing')}
                  </span>
                  <span>
                    <strong>
                      {state.bookings.filter((booking) => booking.orderStatus === 'ready').length}
                    </strong>
                    {w('готовы', 'ready')}
                  </span>
                </div>
              </div>
              <div className="order-filters" role="group" aria-label={w('Фильтр заказов', 'Order filter')}>
                {[
                  ['active', 'Активные', 'Active'],
                  ['pending', 'Новые', 'New'],
                  ['preparing', 'Готовятся', 'Preparing'],
                  ['ready', 'Готовы', 'Ready'],
                  ['completed', 'Завершённые', 'Completed'],
                  ['all', 'Все', 'All'],
                ].map(([id, ru, en]) => (
                  <button
                    className="filter-button"
                    aria-pressed={orderFilter === id}
                    key={id}
                    onClick={() => setOrderFilter(id)}
                  >
                    {w(ru, en)}
                  </button>
                ))}
              </div>
              <div className="order-queue">
                {orders.length ? (
                  orders.map((booking) => {
                    const orderStatus = booking.orderStatus || 'pending';
                    const orderTable = state.tables.find((entry) => entry.id === booking.tableId);
                    const total = booking.preorder.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0,
                    );
                    return (
                      <article className="order-ticket" key={booking.id}>
                        <header>
                          <div>
                            <p className="order-number">#{booking.id.slice(-6).toUpperCase()}</p>
                            <h3>
                              {booking.time} · {w('стол', 'table')} {orderTable?.number || '—'}
                            </h3>
                            <p>
                              {booking.date} · {booking.name} · {booking.guests}{' '}
                              {w('гостей', 'guests')}
                            </p>
                          </div>
                          <span className={`order-status status-${orderStatus}`}>
                            {w(...ORDER_STATUS[orderStatus])}
                          </span>
                        </header>
                        <ul>
                          {booking.preorder.map((item) => (
                            <li key={item.id}>
                              <span>
                                {item.quantity} × {item.name}
                              </span>
                              <span>{money(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <footer>
                          <strong>{money(total)}</strong>
                          <div className="order-actions">
                            {(ORDER_ACTIONS[orderStatus] || []).map(([next, ru, en]) => (
                              <button
                                className={next === 'rejected' ? 'restaurant-text-link' : 'restaurant-button'}
                                disabled={busy}
                                key={next}
                                onClick={() => setOrderStatus(booking.id, next)}
                              >
                                {w(ru, en)}
                              </button>
                            ))}
                          </div>
                        </footer>
                      </article>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    {w('В этой очереди заказов нет.', 'There are no orders in this queue.')}
                  </div>
                )}
              </div>
            </>
          )}
          {tab === 'bookings' && (
            <>
              <h2>{w('Бронирования по времени', 'Reservations by time')}</h2>
              <div className="admin-toolbar">
                <label>
                  {w('Дата смены', 'Service date')}
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label>
                  {w('Поиск гостя', 'Find a guest')}
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={w('Имя или телефон…', 'Name or phone…')}
                  />
                </label>
              </div>
              <p>
                {list.filter((b) => b.status === 'confirmed').length}{' '}
                {w('активных броней', 'active reservations')} ·{' '}
                {list.filter((b) => b.status === 'confirmed').reduce((n, b) => n + b.guests, 0)}{' '}
                {w('гостей', 'guests')}
              </p>
              <div className="admin-bookings">
                {list.length ? (
                  list
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((b) => (
                      <article key={b.id}>
                        <div>
                          <h3>
                            {b.time} — {endTime(b.time, b.duration)}
                          </h3>
                          <p>
                            {w('Стол', 'Table')}{' '}
                            {state.tables.find((t) => t.id === b.tableId)?.number} · {b.guests}{' '}
                            {w('гостей', 'guests')}
                          </p>
                        </div>
                        <div>
                          <strong>{b.name}</strong>
                          <p>{b.fixture ? w('Пример из демо-данных', 'Demo fixture') : b.phone}</p>
                          <p className="small-note">
                            {b.status === 'cancelled'
                              ? w('Отменено', 'Cancelled')
                              : w(
                                  mode === 'firebase' ? 'Бронь сохранена' : 'Демо-бронь сохранена',
                                  mode === 'firebase'
                                    ? 'Reservation saved'
                                    : 'Demo reservation saved',
                                )}
                          </p>
                        </div>
                        <div>
                          {confirm === b.id ? (
                            <>
                              <button
                                className="filter-button"
                                disabled={busy}
                                onClick={() =>
                                  save((s) => {
                                    if (b.status === 'cancelled')
                                      assertBooking(
                                        s,
                                        b.fixture ? { ...b, phone: '+0000000' } : b,
                                        b.id,
                                      );
                                    return {
                                      ...s,
                                      bookings: s.bookings.map((i) =>
                                        i.id === b.id
                                          ? {
                                              ...i,
                                              status:
                                                i.status === 'cancelled'
                                                  ? 'confirmed'
                                                  : 'cancelled',
                                              orderStatus:
                                                i.status === 'confirmed' && i.preorder?.length
                                                  ? 'cancelled'
                                                  : i.orderStatus || 'none',
                                            }
                                          : i,
                                      ),
                                      history: [
                                        ...s.history,
                                        {
                                          id: crypto.randomUUID(),
                                          bookingId: b.id,
                                          action:
                                            b.status === 'cancelled' ? 'restored' : 'cancelled',
                                          at: new Date().toISOString(),
                                        },
                                      ],
                                    };
                                  })
                                }
                              >
                                {w('Подтвердить', 'Confirm')}
                              </button>
                              <button
                                className="restaurant-text-link"
                                onClick={() => setConfirm('')}
                              >
                                {w('Назад', 'Back')}
                              </button>
                            </>
                          ) : (
                            <button
                              className="restaurant-text-link"
                              onClick={() => setConfirm(b.id)}
                            >
                              {b.status === 'cancelled'
                                ? w('Восстановить', 'Restore')
                                : w('Отменить', 'Cancel')}
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                ) : (
                  <div className="empty-state">
                    {w('На эту дату записей нет.', 'No reservations for this date.')}
                  </div>
                )}
              </div>
              <details className="admin-history">
                <summary>
                  {w('История изменений', 'Change history')} · {state.history.length}
                </summary>
                {state.history
                  .slice()
                  .reverse()
                  .slice(0, 30)
                  .map((row) => (
                    <p key={row.id}>
                      {row.at.slice(0, 16).replace('T', ' ')} · {row.bookingId} · {row.action}
                    </p>
                  ))}
              </details>
            </>
          )}
          {tab === 'tables' && (
            <>
              <h2>{w('Геометрия и доступность', 'Layout & availability')}</h2>
              <label className="admin-picker">
                {w('Редактировать стол', 'Edit table')}
                <select value={tableId} onChange={(e) => setTableId(e.target.value)}>
                  {state.tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {w('Стол', 'Table')} {t.number}
                    </option>
                  ))}
                </select>
              </label>
              <form key={tableId} onSubmit={saveTable} className="admin-form">
                <label>
                  {w('Вместимость', 'Seats')}
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    max="8"
                    required
                    defaultValue={table.capacity}
                  />
                </label>
                <label>
                  {w('Зона', 'Area')}
                  <select name="zone" defaultValue={table.zone}>
                    {state.zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {w(z.ru, z.en)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {w('Координата X', 'X coordinate')}
                  <input
                    name="x"
                    type="number"
                    min="110"
                    max="565"
                    defaultValue={table.x}
                    required
                  />
                </label>
                <label>
                  {w('Координата Y', 'Y coordinate')}
                  <input
                    name="y"
                    type="number"
                    min="120"
                    max="550"
                    defaultValue={table.y}
                    required
                  />
                </label>
                <label>
                  {w('Форма', 'Shape')}
                  <select name="shape" defaultValue={table.shape}>
                    <option value="circle">{w('Круглый', 'Round')}</option>
                    <option value="rectangle">{w('Прямоугольный', 'Rectangular')}</option>
                  </select>
                </label>
                <label className="checkbox-label">
                  <input name="blocked" type="checkbox" defaultChecked={table.blocked} />
                  {w('Блокировать стол', 'Block table')}
                </label>
                <label className="checkbox-label">
                  <input
                    name="occupied"
                    type="checkbox"
                    defaultChecked={table.occupiedUntil > Date.now()}
                  />
                  {w('Занят сейчас (45 минут)', 'Occupied now (45 minutes)')}
                </label>
                <fieldset className="table-feature-editor">
                  <legend>{w('Свойства столика', 'Table features')}</legend>
                  {Object.entries(FEATURES).map(([id, names]) => (
                    <label className="checkbox-label" key={id}>
                      <input
                        type="checkbox"
                        name={`feature-${id}`}
                        defaultChecked={table.features.includes(id)}
                      />
                      {w(...names)}
                    </label>
                  ))}
                </fieldset>
                <button className="restaurant-button" disabled={busy}>
                  {w('Сохранить столик', 'Save table')}
                </button>
              </form>
              <h3 className="admin-subheading">{w('Названия зон', 'Area names')}</h3>
              <form
                className="zone-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  save((s) => ({
                    ...s,
                    zones: s.zones.map((z) => ({
                      ...z,
                      ru: f.get(`${z.id}-ru`).trim(),
                      en: f.get(`${z.id}-en`).trim(),
                    })),
                  }));
                }}
              >
                {state.zones.map((z) => (
                  <div key={z.id}>
                    <label>
                      {z.id} · RU
                      <input name={`${z.id}-ru`} defaultValue={z.ru} required maxLength="30" />
                    </label>
                    <label>
                      {z.id} · EN
                      <input name={`${z.id}-en`} defaultValue={z.en} required maxLength="30" />
                    </label>
                  </div>
                ))}
                <button className="restaurant-button" disabled={busy}>
                  {w('Сохранить зоны', 'Save areas')}
                </button>
              </form>
            </>
          )}
          {tab === 'menu' && (
            <>
              <h2>{w('Управление меню', 'Menu management')}</h2>
              <p>
                {catalog.length} {w('позиций в каталоге', 'items in the catalogue')} ·{' '}
                {catalog.filter((item) => getItem(item, state).hidden).length}{' '}
                {w('скрыто', 'hidden')}
              </p>
              <div className="admin-toolbar menu-admin-toolbar">
                <label>
                  {w('Поиск позиции', 'Find an item')}
                  <input
                    type="search"
                    value={menuSearch}
                    onChange={(event) => setMenuSearch(event.target.value)}
                    placeholder={w('Название…', 'Name…')}
                  />
                </label>
                <label>
                  {w('Категория', 'Category')}
                  <select
                    value={menuCategory}
                    onChange={(event) => setMenuCategory(event.target.value)}
                  >
                    <option value="all">{w('Все категории', 'All categories')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {w(category.ru, category.en)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="menu-admin-list" aria-label={w('Позиции меню', 'Menu items')}>
                {visibleMenuItems.map((item) => {
                  const current = getItem(item, state);
                  return (
                    <div className={current.hidden ? 'is-hidden' : ''} key={item.id}>
                      <button
                        className="menu-admin-item"
                        onClick={() => setDishId(item.id)}
                        aria-pressed={dishId === item.id}
                      >
                        <img src={item.image} alt="" width="48" height="48" />
                        <span>
                          <strong>{w(current.nameRu, current.nameEn)}</strong>
                          <small>
                            {w(
                              categories.find((category) => category.id === item.category)?.ru || '',
                              categories.find((category) => category.id === item.category)?.en || '',
                            )}{' '}
                            · {money(current.price)}
                          </small>
                        </span>
                      </button>
                      <button
                        className="visibility-toggle"
                        disabled={busy}
                        aria-pressed={!current.hidden}
                        onClick={() => toggleMenuItem(item)}
                      >
                        {current.hidden ? w('Вернуть', 'Show') : w('Скрыть', 'Hide')}
                      </button>
                    </div>
                  );
                })}
              </div>
              {!visibleMenuItems.length && (
                <div className="empty-state">{w('Ничего не найдено.', 'Nothing found.')}</div>
              )}
              <h3 className="admin-subheading">{w('Редактор позиции', 'Item editor')}</h3>
              <label className="admin-picker">
                {w('Редактировать позицию', 'Edit item')}
                <select value={dishId} onChange={(e) => setDishId(e.target.value)}>
                  {catalog.map((i) => (
                    <option key={i.id} value={i.id}>
                      {w(getItem(i, state).nameRu, getItem(i, state).nameEn)}
                    </option>
                  ))}
                </select>
              </label>
              <form
                key={dishId}
                className="admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  save((s) => ({
                    ...s,
                    menuOverrides: {
                      ...s.menuOverrides,
                      [dishId]: {
                        nameRu: f.get('nameRu').trim(),
                        nameEn: f.get('nameEn').trim(),
                        price: Number(f.get('price')),
                        hidden: f.get('hidden') === 'on',
                      },
                    },
                  }));
                }}
              >
                <label>
                  {w('Название RU', 'Name RU')}
                  <input name="nameRu" defaultValue={dish.nameRu} required maxLength="70" />
                </label>
                <label>
                  {w('Название EN', 'Name EN')}
                  <input name="nameEn" defaultValue={dish.nameEn} required maxLength="70" />
                </label>
                <label>
                  {w('Демо-цена BYN', 'Demo price BYN')}
                  <input
                    name="price"
                    type="number"
                    min="1"
                    max="500"
                    step=".01"
                    defaultValue={dish.price}
                    required
                  />
                </label>
                <label className="checkbox-label">
                  <input name="hidden" type="checkbox" defaultChecked={dish.hidden} />
                  {w('Скрыть из меню', 'Hide from menu')}
                </label>
                <button className="restaurant-button" disabled={busy}>
                  {w('Сохранить позицию', 'Save item')}
                </button>
              </form>
              <p className="small-note">
                {w('Цена сейчас', 'Current price')}: {money(dish.price)}.{' '}
                {w(
                  mode === 'firebase'
                    ? 'Изменения синхронизируются с публичным меню через Firebase.'
                    : 'Изменения видны в публичном демо-меню этого браузера.',
                  mode === 'firebase'
                    ? 'Changes are synced to the public menu through Firebase.'
                    : 'Changes appear in the demo menu in this browser.',
                )}
              </p>
            </>
          )}
          {tab === 'settings' && (
            <>
              <h2>{w('Правила визита', 'Visit settings')}</h2>
              <form
                className="settings-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  save((s) => ({
                    ...s,
                    settings: { ...s.settings, duration: Number(f.get('duration')) },
                  }));
                }}
              >
                <label>
                  {w('Длительность новых броней', 'Duration for new reservations')}
                  <select name="duration" defaultValue={state.settings.duration}>
                    {[60, 90, 120, 150, 180].map((n) => (
                      <option key={n} value={n}>
                        {n} {w('минут', 'minutes')}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  {w(
                    'Существующие визиты сохраняют первоначальную длительность. Демо-часы приёма: 12:00–23:00.',
                    'Existing visits keep their original duration. Demo service hours: 12:00–23:00.',
                  )}
                </p>
                <button className="restaurant-button" disabled={busy}>
                  {w('Сохранить правила', 'Save settings')}
                </button>
              </form>
              <h3 className="admin-subheading">{w('Особые даты', 'Special dates')}</h3>
              <form
                className="settings-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = new FormData(e.currentTarget).get('closed');
                  save((s) => ({
                    ...s,
                    settings: {
                      ...s.settings,
                      closedDates: [...new Set([...s.settings.closedDates, value])],
                    },
                  }));
                }}
              >
                <label>
                  {w('Дата без новых броней', 'Date closed for new reservations')}
                  <input name="closed" type="date" min={today()} required />
                </label>
                <p className="small-note">
                  {w(
                    'Закрытие даты не отменяет уже сохранённые визиты.',
                    'Closing a date does not cancel existing visits.',
                  )}
                </p>
                <button className="restaurant-button" disabled={busy}>
                  {w('Закрыть дату', 'Close date')}
                </button>
              </form>
              {state.settings.closedDates.map((d) => (
                <div className="closed-date" key={d}>
                  <span>{d}</span>
                  <button
                    className="restaurant-text-link"
                    onClick={() =>
                      save((s) => ({
                        ...s,
                        settings: {
                          ...s.settings,
                          closedDates: s.settings.closedDates.filter((i) => i !== d),
                        },
                      }))
                    }
                  >
                    {w('Открыть дату', 'Reopen date')} ×
                  </button>
                </div>
              ))}
            </>
          )}
          <p className="action-notice" role="status">
            {notice}
          </p>
        </div>
      </div>
    </>
  );
}
