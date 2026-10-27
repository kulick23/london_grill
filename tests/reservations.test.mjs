import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertBooking,
  overlaps,
  seedState,
  tableStatus,
  validSlot,
  recommendTables,
  endTime,
} from '../src/features/restaurant/booking/model.js';
const request = {
  date: '2030-11-05',
  time: '19:00',
  duration: 120,
  guests: 2,
  zone: 'all',
  tableId: 't1',
  name: 'Test Guest',
  phone: '+375291234567',
};
const state = () => ({ ...seedState(), bookings: [] });
test('overlapping intervals conflict; adjacent intervals remain available', () => {
  assert.equal(overlaps(1140, 1260, 1200, 1320), true);
  assert.equal(overlaps(1140, 1260, 1260, 1380), false);
  const s = state();
  s.bookings = [{ ...request, id: 'existing', status: 'confirmed' }];
  assert.equal(tableStatus(s.tables[0], request, s), 'reserved');
  assert.equal(tableStatus(s.tables[0], { ...request, time: '21:00' }, s), 'available');
  assert.equal(tableStatus(s.tables[0], { ...request, date: '2030-11-06' }, s), 'available');
  assert.equal(tableStatus(s.tables[0], request, s, 'existing'), 'available');
  assert.throws(() => assertBooking(s, request), /conflict/);
});
test('capacity, blocked tables and special days prevent booking', () => {
  const s = state();
  assert.equal(tableStatus(s.tables[0], { ...request, guests: 4 }, s), 'unavailable');
  assert.equal(tableStatus(s.tables[8], request, s), 'unavailable');
  s.settings.closedDates = [request.date];
  assert.throws(() => assertBooking(s, request), /conflict/);
});
test('cancelled reservations release tables; physical occupancy does not block a future day', () => {
  const s = state();
  s.bookings = [{ ...request, id: 'cancelled', status: 'cancelled' }];
  assert.equal(
    tableStatus({ ...s.tables[0], occupiedUntil: Date.now() + 2700000 }, request, s),
    'available',
  );
  assert.doesNotThrow(() => assertBooking(s, request));
});
test('dates, opening hours and entire visit duration are validated', () => {
  assert.equal(validSlot('2030-02-30', '19:00', 120), false);
  assert.equal(validSlot('2030-11-05', '22:00', 120), false);
  assert.equal(validSlot('2030-11-05', '21:00', 120), true);
  assert.equal(validSlot('2020-01-01', '19:00', 120), false);
  assert.equal(endTime('19:30', 90), '21:00');
});
test('recommendations use stored attributes and appropriate capacity', () => {
  const s = state();
  const result = recommendTables(s.tables, request, s, 'quiet');
  assert.equal(result[0].id, 't8');
  assert.ok(result[0].features.includes('quiet'));
  const window = recommendTables(
    s.tables,
    { ...request, zone: 'window', guests: 4 },
    s,
    'romantic',
  );
  assert.equal(window.length, 1);
  assert.equal(window[0].id, 't3');
});
test('invalid guest contacts and out-of-range party sizes are rejected', () => {
  assert.throws(() => assertBooking(state(), { ...request, name: '' }), /guest/);
  assert.throws(() => assertBooking(state(), { ...request, phone: '123' }), /guest/);
  assert.throws(() => assertBooking(state(), { ...request, guests: 0 }), /conflict/);
});
