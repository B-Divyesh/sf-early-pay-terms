import type { CalculationInput, SavedCalculation, SavedTemplate } from './types';

// The demo deliberately has a physically separate IndexedDB database.  Do not
// fold this into a key prefix: opening the demo must never even read a real
// customer's database.
const DB_NAME = document.documentElement.dataset.demo === 'true' ? 'demo:early-pay-terms' : 'early-pay-terms';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('state')) db.createObjectStore('state');
      if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function request<T>(store: string, mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = action(tx.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export const db = {
  loadDraft: () => request<CalculationInput | undefined>('state', 'readonly', (s) => s.get('draft')),
  saveDraft: (input: CalculationInput) => request<IDBValidKey>('state', 'readwrite', (s) => s.put(input, 'draft')),
  getHistory: () => request<SavedCalculation[]>('history', 'readonly', (s) => s.getAll()),
  saveHistory: (record: SavedCalculation) => request<IDBValidKey>('history', 'readwrite', (s) => s.put(record)),
  deleteHistory: (id: string) => request<undefined>('history', 'readwrite', (s) => s.delete(id)),
  clearHistory: () => request<undefined>('history', 'readwrite', (s) => s.clear()),
  getTemplates: () => request<SavedTemplate[]>('templates', 'readonly', (s) => s.getAll()),
  saveTemplate: (template: SavedTemplate) => request<IDBValidKey>('templates', 'readwrite', (s) => s.put(template)),
  clearAll: async () => {
    const database = await openDb();
    const tx = database.transaction(['state', 'history', 'templates'], 'readwrite');
    tx.objectStore('state').clear(); tx.objectStore('history').clear(); tx.objectStore('templates').clear();
    return new Promise<void>((resolve, reject) => { tx.oncomplete = () => { database.close(); resolve(); }; tx.onerror = () => reject(tx.error); });
  },
  clearDemo: async () => {
    if (DB_NAME !== 'demo:early-pay-terms') return;
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Close other demo tabs, then reset the demo again.'));
    });
  }
};
