/* Storage locale (con ripiego in memoria), token e sincronizzazione app_state
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

const memory = {};
const store = (() => {
  try {
    const k = '__itsx_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch (_) {
    return {
      getItem: (k) => (k in memory ? memory[k] : null),
      setItem: (k, v) => { memory[k] = String(v); },
      removeItem: (k) => { delete memory[k]; }
    };
  }
})();

const read = (key, fallback) => {
  try {
    const raw = store.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (_) { return fallback; }
};
const API_BASE = window.ITS_API_BASE || '/api';
let serverReady = false;
const syncTimers = new Map();
// Il token JWT è salvato come stringa semplice (non JSON): lo leggo direttamente dallo storage.
const getToken = () => {
  let token = store.getItem('itsx.accessToken');
  if (token && token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
  return token || '';
};
const serverSync = async (key, value) => {
  if (!serverReady) return;
  const token = getToken();
  if (!token) return; // senza login il backend rifiuta le scritture su app_state: si sincronizzerà dopo l'accesso
  try {
    const res = await fetch(`${API_BASE}/state/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(value)
    });
    if (!res.ok) console.warn('Salvataggio app_state rifiutato:', key, res.status);
  } catch (err) {
    console.warn('Sincronizzazione server non riuscita:', key, err);
    if (window.__itsToast) window.__itsToast('Server non raggiungibile: modifiche salvate temporaneamente nel browser.', 'err');
  }
};
// Invia al DB (tabella app_state) tutti i dati condivisi presenti nel browser
const pushState = async () => {
  if (!serverReady || !getToken()) return;
  for (const key of [KEY.users, KEY.seed, KEY.attesa, KEY.risultati]) {
    const value = read(key, null);
    if (value !== null) await serverSync(key, value);
  }
};
const write = (key, value) => {
  try { store.setItem(key, JSON.stringify(value)); } catch (_) { /* quota piena: ignora */ }
  // Sessione: solo browser. Tornei e iscrizioni: sono nelle tabelle MySQL (tornei/iscrizioni), non in app_state.
  if (serverReady && key !== KEY.session && key !== KEY.tornei && key !== KEY.iscrizioni) {
    clearTimeout(syncTimers.get(key));
    syncTimers.set(key, setTimeout(() => { serverSync(key, value); syncTimers.delete(key); }, 120));
  }
};

const getUsers = () => read(KEY.users, []);
const setUsers = (v) => write(KEY.users, v);
const getTornei = () => read(KEY.tornei, []);
const setTornei = (v) => write(KEY.tornei, v);
const getIscrizioni = () => read(KEY.iscrizioni, []);
const setIscrizioni = (v) => write(KEY.iscrizioni, v);
const getAttesa = () => read(KEY.attesa, []);
const setAttesa = (v) => write(KEY.attesa, v);
const getRisultati = () => read(KEY.risultati, []);
const setRisultati = (v) => write(KEY.risultati, v);

const getTorneo = (id) => getTornei().find((t) => String(t.id) === String(id)) || null;
const same = (a, b) => String(a) === String(b);
const getUser = (id) => getUsers().find((u) => same(u.id, id)) || null;
