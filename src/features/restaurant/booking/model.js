/** Local demonstration model. Coordinates adapt the legacy r1 layout, not a measured London Grill plan. */
export const ZONES = [
  { id: 'window', ru: 'У окон', en: 'By the windows' },
  { id: 'main', ru: 'Основной зал', en: 'Main room' },
  { id: 'lounge', ru: 'Тихая гостиная', en: 'Quiet lounge' },
];
export const FEATURES = {
  window: ['У окна', 'Window seat'],
  quiet: ['Тихое место', 'Quiet corner'],
  romantic: ['Для двоих', 'For two'],
  friends: ['Для компании', 'For friends'],
  bar: ['Рядом с баром', 'Near the bar'],
};
export const TABLES = [
  {
    id: 't1',
    number: 1,
    capacity: 2,
    x: 145,
    y: 138,
    zone: 'window',
    shape: 'circle',
    features: ['window', 'romantic'],
  },
  {
    id: 't2',
    number: 2,
    capacity: 2,
    x: 335,
    y: 138,
    zone: 'window',
    shape: 'circle',
    features: ['window', 'romantic'],
  },
  {
    id: 't3',
    number: 3,
    capacity: 4,
    x: 535,
    y: 138,
    zone: 'window',
    shape: 'rectangle',
    features: ['window', 'friends'],
  },
  {
    id: 't4',
    number: 4,
    capacity: 4,
    x: 145,
    y: 335,
    zone: 'main',
    shape: 'rectangle',
    features: ['friends', 'bar'],
  },
  {
    id: 't5',
    number: 5,
    capacity: 2,
    x: 335,
    y: 335,
    zone: 'main',
    shape: 'circle',
    features: ['bar'],
  },
  {
    id: 't6',
    number: 6,
    capacity: 6,
    x: 535,
    y: 335,
    zone: 'main',
    shape: 'rectangle',
    features: ['friends'],
  },
  {
    id: 't7',
    number: 7,
    capacity: 4,
    x: 145,
    y: 535,
    zone: 'lounge',
    shape: 'rectangle',
    features: ['quiet'],
  },
  {
    id: 't8',
    number: 8,
    capacity: 2,
    x: 335,
    y: 535,
    zone: 'lounge',
    shape: 'circle',
    features: ['quiet', 'romantic'],
  },
  {
    id: 't9',
    number: 9,
    capacity: 6,
    x: 535,
    y: 535,
    zone: 'lounge',
    shape: 'rectangle',
    features: ['quiet', 'friends'],
    blocked: true,
  },
];
export const STATUS = {
  available: ['Доступен', 'Available'],
  reserved: ['Забронирован', 'Reserved'],
  occupied: ['Занят сейчас', 'Occupied now'],
  unavailable: ['Недоступен', 'Unavailable'],
  selected: ['Выбран', 'Selected'],
};
export const ORDER_STATUS = {
  none: ['Нет заказа', 'No order'],
  pending: ['Ожидает подтверждения', 'Awaiting confirmation'],
  accepted: ['Принят', 'Accepted'],
  preparing: ['Готовится', 'Preparing'],
  ready: ['Готов', 'Ready'],
  completed: ['Завершён', 'Completed'],
  rejected: ['Отклонён', 'Rejected'],
  cancelled: ['Отменён', 'Cancelled'],
};
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Minsk',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export function addDays(date, days) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function minutes(time) {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + m;
}
export function endTime(time, duration) {
  const n = minutes(time) + duration;
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}
export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;
export function validSlot(date, time, duration, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date)
    return false;
  return (
    Number.isInteger(duration) &&
    duration >= 60 &&
    duration <= 240 &&
    minutes(time) >= 720 &&
    minutes(time) + duration <= 1380 &&
    new Date(`${date}T${time}:00+03:00`).getTime() > now
  );
}
export function tableStatus(table, request, state, ignoreId) {
  if (
    table.blocked ||
    table.capacity < request.guests ||
    state.settings.closedDates.includes(request.date) ||
    !validSlot(request.date, request.time, request.duration)
  )
    return 'unavailable';
  const start = minutes(request.time),
    end = start + request.duration;
  if (
    state.bookings.some(
      (b) =>
        b.id !== ignoreId &&
        b.status === 'confirmed' &&
        b.tableId === table.id &&
        b.date === request.date &&
        overlaps(start, end, minutes(b.time), minutes(b.time) + b.duration),
    )
  )
    return 'reserved';
  const requestedStart = new Date(`${request.date}T${request.time}:00+03:00`).getTime();
  const requestedEnd = requestedStart + request.duration * 60000;
  if (
    table.occupiedUntil &&
    overlaps(requestedStart, requestedEnd, Date.now(), table.occupiedUntil)
  )
    return 'occupied';
  return 'available';
}
export function recommendTables(tables, request, state, preference, ignoreId) {
  return tables
    .filter(
      (t) =>
        tableStatus(t, request, state, ignoreId) === 'available' &&
        (request.zone === 'all' || request.zone === t.zone),
    )
    .map((t) => ({
      ...t,
      score:
        (preference && t.features.includes(preference) ? 100 : 0) - (t.capacity - request.guests),
    }))
    .sort((a, b) => b.score - a.score || a.number - b.number);
}
export function seedState() {
  const date = addDays(today(), 1);
  return {
    version: 1,
    bookings: [
      {
        id: 'DEMO-SEED',
        date,
        time: '19:00',
        duration: 120,
        guests: 4,
        tableId: 't3',
        name: 'Демонстрационная бронь',
        phone: '',
        notes: '',
        status: 'confirmed',
        preorder: [],
        orderStatus: 'none',
        fixture: true,
        createdAt: new Date().toISOString(),
      },
    ],
    waitlist: [],
    cart: [],
    favorites: [],
    tables: TABLES,
    zones: ZONES,
    settings: { duration: 120, closedDates: [] },
    history: [],
    menuOverrides: {},
  };
}
export function assertBooking(state, request, ignoreId) {
  const table = state.tables.find((t) => t.id === request.tableId);
  if (
    !Number.isInteger(request.guests) ||
    request.guests < 1 ||
    request.guests > 8 ||
    !table ||
    tableStatus(table, request, state, ignoreId) !== 'available'
  )
    throw new Error('conflict');
  if (!validGuest(request.name, request.phone)) throw new Error('guest');
}

export function validGuest(name, phone) {
  return (
    Boolean(name?.trim()) &&
    /^[+\d\s()\-]{7,24}$/.test(phone || '') &&
    (phone || '').replace(/\D/g, '').length >= 7
  );
}
