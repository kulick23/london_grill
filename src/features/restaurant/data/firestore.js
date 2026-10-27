import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { seedState } from '../booking/model';

const RESTAURANT_CONFIG = 'restaurant/config';
const MAX_DURATION = 180;

const clean = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));

const bookingPath = (uid, id) => doc(db, 'users', uid, 'bookings', id);
const availabilityPath = (id) => doc(db, 'availability', id);
const asDate = (date, time) => new Date(`${date}T${time}:00+03:00`);

export function slotIdsFor(booking) {
  if (
    !Number.isInteger(booking.duration) ||
    booking.duration < 60 ||
    booking.duration > MAX_DURATION
  )
    throw new Error('slot');
  const slots = [];
  const start = asDate(booking.date, booking.time);
  for (let minutes = 0; minutes < booking.duration; minutes += 30) {
    const value = new Date(start.getTime() + minutes * 60000);
    const hh = String(value.getUTCHours() + 3).padStart(2, '0');
    const mm = String(value.getUTCMinutes()).padStart(2, '0');
    slots.push(`${booking.date}_${booking.tableId}_${hh}${mm}`);
  }
  return slots;
}

function reservationRecord(input, uid, id) {
  const start = asDate(input.date, input.time);
  const end = new Date(start.getTime() + input.duration * 60000);
  const slotIds = input.status === 'cancelled' ? [] : slotIdsFor(input);
  const preorder = input.preorder || [];
  const orderStatus =
    input.status === 'cancelled' && preorder.length
      ? 'cancelled'
      : input.orderStatus || (preorder.length ? 'pending' : 'none');
  return clean({
    id,
    ownerId: uid,
    tableId: input.tableId,
    date: input.date,
    time: input.time,
    duration: input.duration,
    guests: input.guests,
    name: input.name.trim(),
    phone: input.phone.trim(),
    notes: input.notes?.trim() || '',
    status: input.status || 'confirmed',
    preorder,
    orderStatus,
    slotIds,
    startsAt: Timestamp.fromDate(start),
    endsAt: Timestamp.fromDate(end),
  });
}

function publicRecord(booking) {
  return {
    bookingId: booking.id,
    tableId: booking.tableId,
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    status: booking.status,
    slotIds: booking.slotIds,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
  };
}

async function saveReservation(ownerUid, previous, input) {
  const id = input.id;
  await runTransaction(db, async (transaction) => {
    const privateRef = bookingPath(ownerUid, id);
    const currentSnapshot = await transaction.get(privateRef);
    const current = currentSnapshot.exists() ? currentSnapshot.data() : null;
    if (previous && (!current || current.ownerId !== ownerUid)) throw new Error('conflict');
    if (!previous && current) throw new Error('conflict');

    const next = reservationRecord(input, ownerUid, id);
    const oldSlots = current?.slotIds || [];
    const allSlots = [...new Set([...oldSlots, ...next.slotIds])];
    const slotRefs = allSlots.map((slotId) => doc(db, 'reservationSlots', slotId));
    const snapshots = [];
    for (const ref of slotRefs) snapshots.push(await transaction.get(ref));
    snapshots.forEach((snapshot) => {
      if (next.slotIds.includes(snapshot.id) && snapshot.exists()) {
        const claim = snapshot.data();
        if (claim.bookingId !== id) throw new Error('conflict');
      }
    });

    transaction.set(
      privateRef,
      {
        ...next,
        createdAt: current?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        orderUpdatedAt: serverTimestamp(),
      },
      { merge: false },
    );
    if (next.status === 'confirmed') {
      transaction.set(availabilityPath(id), publicRecord(next), { merge: false });
    } else {
      transaction.delete(availabilityPath(id));
    }
    allSlots.forEach((slotId) => {
      const ref = doc(db, 'reservationSlots', slotId);
      if (next.slotIds.includes(slotId)) {
        transaction.set(ref, {
          bookingId: id,
          ownerId: ownerUid,
          tableId: next.tableId,
          startsAt: next.startsAt,
          endsAt: next.endsAt,
        });
      } else {
        transaction.delete(ref);
      }
    });
  });
}

function changedRows(before, after) {
  const left = new Map(before.map((row) => [row.id, row]));
  const right = new Map(after.map((row) => [row.id, row]));
  return [...new Set([...left.keys(), ...right.keys()])]
    .filter((id) => JSON.stringify(left.get(id)) !== JSON.stringify(right.get(id)))
    .map((id) => ({ id, before: left.get(id), after: right.get(id) }));
}

async function syncCollection(uid, name, before, after) {
  const changes = changedRows(before, after);
  if (changes.length > 40) throw new Error('limit');
  const batch = writeBatch(db);
  changes.forEach(({ id, after: row }) => {
    const ref = doc(db, 'users', uid, name, id);
    if (row) batch.set(ref, clean(row), { merge: false });
    else batch.delete(ref);
  });
  await batch.commit();
}

export async function mutateFirestoreState(user, current, change, isAdmin) {
  if (!user) throw new Error('auth-required');
  const next = change(structuredClone(current));
  const bookingChanges = changedRows(
    current.bookings.filter((b) => !b.fixture),
    next.bookings.filter((b) => !b.fixture),
  );
  const cartChanges = changedRows(current.cart, next.cart);
  const favoriteChanges = changedRows(
    current.favorites.map((id) => ({ id })),
    next.favorites.map((id) => ({ id })),
  );
  const waitChanges = changedRows(current.waitlist, next.waitlist);
  const configChanged =
    JSON.stringify([current.tables, current.zones, current.settings, current.menuOverrides]) !==
    JSON.stringify([next.tables, next.zones, next.settings, next.menuOverrides]);

  const groups = [
    bookingChanges.length,
    cartChanges.length,
    favoriteChanges.length,
    waitChanges.length,
    configChanged,
  ].filter(Boolean);
  if (groups.length === 0) return current;
  if (groups.length !== 1) throw new Error('unsupported-change');
  if (bookingChanges.length) {
    if (bookingChanges.length !== 1) throw new Error('limit');
    const row = bookingChanges[0];
    if (!row.after) throw new Error('unsupported-change');
    await saveReservation(row.after._ownerId || user.uid, row.before, row.after);
  } else if (cartChanges.length) {
    await syncCollection(user.uid, 'cart', current.cart, next.cart);
  } else if (favoriteChanges.length) {
    await syncCollection(
      user.uid,
      'favorites',
      current.favorites.map((id) => ({ id })),
      next.favorites.map((id) => ({ id })),
    );
  } else if (waitChanges.length) {
    await syncCollection(user.uid, 'waitlist', current.waitlist, next.waitlist);
  } else if (configChanged) {
    if (!isAdmin) throw new Error('forbidden');
    await setDoc(doc(db, RESTAURANT_CONFIG), {
      tables: next.tables,
      zones: next.zones,
      settings: next.settings,
      menuOverrides: next.menuOverrides,
      updatedAt: serverTimestamp(),
    });
  }
  return next;
}

const fromSnapshot = (snapshot) =>
  snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
const serializableBooking = (row) => ({
  ...row,
  _ownerId: row.ownerId,
  orderStatus: row.orderStatus || (row.preorder?.length ? 'pending' : 'none'),
  createdAt: row.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
  orderUpdatedAt: row.orderUpdatedAt?.toDate?.().toISOString(),
  startsAt: undefined,
  endsAt: undefined,
  slotIds: undefined,
  ownerId: undefined,
});

export function subscribeFirestoreState(user, isAdmin, onState, onError) {
  const base = { ...seedState(), bookings: [], cart: [], favorites: [], waitlist: [], history: [] };
  const parts = {
    config: null,
    bookings: [],
    availability: [],
    cart: [],
    favorites: [],
    waitlist: [],
  };
  const publish = () => {
    const ownIds = new Set(parts.bookings.map((row) => row.id));
    const occupied = parts.availability
      .filter((row) => !ownIds.has(row.id))
      .map((row) => ({ ...row, id: row.id, fixture: true, status: 'confirmed' }));
    onState({
      ...base,
      ...(parts.config || {}),
      bookings: [...parts.bookings.map(serializableBooking), ...occupied.map(serializableBooking)],
      cart: parts.cart.map(({ id, quantity }) => ({ id, quantity })),
      favorites: parts.favorites.map(({ id }) => id),
      waitlist: parts.waitlist.map(serializableBooking),
    });
  };
  const listen = (name, reference) =>
    onSnapshot(
      reference,
      (snapshot) => {
        parts[name] = snapshot.docs
          ? fromSnapshot(snapshot)
          : snapshot.exists()
            ? snapshot.data()
            : null;
        publish();
      },
      onError,
    );
  const now = Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000));
  const unsubscribes = [
    listen('config', doc(db, RESTAURANT_CONFIG)),
    listen(
      'bookings',
      isAdmin ? collectionGroup(db, 'bookings') : collection(db, 'users', user.uid, 'bookings'),
    ),
    listen('availability', query(collection(db, 'availability'), where('endsAt', '>=', now))),
    listen('cart', collection(db, 'users', user.uid, 'cart')),
    listen('favorites', collection(db, 'users', user.uid, 'favorites')),
    listen('waitlist', collection(db, 'users', user.uid, 'waitlist')),
  ];
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}

export async function removeWaitlistRecord(uid, id) {
  await deleteDoc(doc(db, 'users', uid, 'waitlist', id));
}

export async function hasRestaurantConfig() {
  return (await getDoc(doc(db, RESTAURANT_CONFIG))).exists();
}

export async function isFirebaseAdmin(uid) {
  return (await getDoc(doc(db, 'admins', uid))).exists();
}
