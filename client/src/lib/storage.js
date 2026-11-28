// import { getItem, setItem, removeItem } from 'localforage';

const PROFILE_KEY = 'dinkatha.profile';
const ENTRIES_KEY = 'dinkatha.entries';

export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function getEntries() {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  try {
    const entries = getEntries().filter(e => e.id !== entry.id);
    entries.push(entry);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch {}
}

export function deleteEntry(id) {
  try {
    const entries = getEntries().filter(e => e.id !== id);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch {}
}

export function clearAll() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ENTRIES_KEY);
  } catch {}
}
