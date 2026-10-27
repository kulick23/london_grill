import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

const projectId = 'demo-projectbar-rules';
const [host, rawPort] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');
let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port: Number(rawPort),
      rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
    },
  });
});

beforeEach(async () => environment.clearFirestore());
after(async () => environment.cleanup());

function futureVisit(offsetHours = 48) {
  const start = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  start.setUTCMinutes(0, 0, 0);
  const minsk = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const date = minsk.toISOString().slice(0, 10);
  const time = minsk.toISOString().slice(11, 16);
  return { start, date, time };
}

async function createReservation(database, uid, id, slotIds, offsetHours = 48) {
  const { start, date, time } = futureVisit(offsetHours);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const bookingRef = doc(database, 'users', uid, 'bookings', id);
  const availabilityRef = doc(database, 'availability', id);
  const slotRefs = slotIds.map((slotId) => doc(database, 'reservationSlots', slotId));
  return runTransaction(database, async (transaction) => {
    for (const ref of slotRefs) await transaction.get(ref);
    const common = {
      id,
      ownerId: uid,
      tableId: 't1',
      date,
      time,
      duration: 60,
      guests: 2,
      name: 'Rule Test',
      phone: '+375291234567',
      notes: '',
      status: 'confirmed',
      preorder: [],
      orderStatus: 'none',
      orderUpdatedAt: serverTimestamp(),
      slotIds,
      startsAt: Timestamp.fromDate(start),
      endsAt: Timestamp.fromDate(end),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    transaction.set(bookingRef, common);
    transaction.set(availabilityRef, {
      bookingId: id,
      tableId: common.tableId,
      date,
      time,
      duration: 60,
      status: 'confirmed',
      slotIds,
      startsAt: common.startsAt,
      endsAt: common.endsAt,
    });
    slotRefs.forEach((ref) =>
      transaction.set(ref, {
        bookingId: id,
        ownerId: uid,
        tableId: common.tableId,
        startsAt: common.startsAt,
        endsAt: common.endsAt,
      }),
    );
  });
}

test('requires authentication for restaurant and availability data', async () => {
  const database = environment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(database, 'restaurant', 'config')));
  await assertFails(getDoc(doc(database, 'availability', 'booking')));
});

test('owner creates an atomic reservation, while another user cannot read its PII', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  const stranger = environment.authenticatedContext('stranger').firestore();
  await assertSucceeds(createReservation(owner, 'owner', 'LG-OWNER01', ['slot-a', 'slot-b']));
  await assertSucceeds(getDoc(doc(owner, 'users', 'owner', 'bookings', 'LG-OWNER01')));
  await assertFails(getDoc(doc(stranger, 'users', 'owner', 'bookings', 'LG-OWNER01')));
  await assertSucceeds(getDoc(doc(stranger, 'availability', 'LG-OWNER01')));
});

test('a second user cannot replace another reservation slot', async () => {
  const first = environment.authenticatedContext('first').firestore();
  const second = environment.authenticatedContext('second').firestore();
  await assertSucceeds(createReservation(first, 'first', 'LG-FIRST01', ['same-a', 'same-b']));
  await assertFails(createReservation(second, 'second', 'LG-SECOND1', ['same-a', 'same-b']));
});

test('cancelling releases availability and slots in the same transaction', async () => {
  const database = environment.authenticatedContext('owner').firestore();
  await assertSucceeds(
    createReservation(database, 'owner', 'LG-CANCEL1', ['cancel-a', 'cancel-b']),
  );
  await assertSucceeds(
    runTransaction(database, async (transaction) => {
      const bookingRef = doc(database, 'users', 'owner', 'bookings', 'LG-CANCEL1');
      const snapshot = await transaction.get(bookingRef);
      transaction.update(bookingRef, {
        status: 'cancelled',
        slotIds: [],
        updatedAt: serverTimestamp(),
        orderUpdatedAt: serverTimestamp(),
      });
      transaction.delete(doc(database, 'availability', 'LG-CANCEL1'));
      snapshot
        .data()
        .slotIds.forEach((slotId) => transaction.delete(doc(database, 'reservationSlots', slotId)));
    }),
  );
  assert.equal((await getDoc(doc(database, 'availability', 'LG-CANCEL1'))).exists(), false);
});

test('only a server-managed admin record can change restaurant configuration', async () => {
  const user = environment.authenticatedContext('user').firestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'admins', 'admin'), { enabled: true });
  });
  const admin = environment.authenticatedContext('admin').firestore();
  const config = {
    tables: [],
    zones: [],
    settings: { duration: 120, closedDates: [] },
    menuOverrides: {},
    updatedAt: serverTimestamp(),
  };
  await assertFails(setDoc(doc(user, 'restaurant', 'config'), config));
  await assertSucceeds(setDoc(doc(admin, 'restaurant', 'config'), config));
});

test('profile collections reject malformed or oversized values', async () => {
  const database = environment.authenticatedContext('owner').firestore();
  await assertFails(
    setDoc(doc(database, 'users', 'owner', 'cart', 'dish'), {
      id: 'dish',
      quantity: 999,
      injectedRole: 'admin',
    }),
  );
});
