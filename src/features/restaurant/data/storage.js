import { seedState } from '../booking/model';
export const STORAGE_KEY = 'london-grill:experience:v1';
export function readState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedState();
  const data = JSON.parse(raw);
  if (
    data.version !== 1 ||
    !['bookings', 'tables', 'zones', 'cart', 'favorites', 'waitlist', 'history'].every((key) =>
      Array.isArray(data[key]),
    ) ||
    !data.settings ||
    !Array.isArray(data.settings.closedDates) ||
    !data.menuOverrides
  )
    throw new Error('storage-corrupt');
  return data;
}
/** Web Locks serialize writes among tabs on this origin. This is still a browser-only demo, not restaurant synchronisation. */
export async function mutateState(change) {
  const commit = () => {
    const current = readState();
    const next = change(current);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };
  return navigator.locks ? navigator.locks.request(STORAGE_KEY, commit) : commit();
}
