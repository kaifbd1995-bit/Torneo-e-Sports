/* Chiamate REST al backend e sincronizzazione con il database
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

function authHeader() {
  const token = getToken();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) }
    });
  } catch (_) {
    throw new Error('Server non raggiungibile. Riprova tra poco.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const err = new Error(body.errore || body.message || 'Sessione scaduta o permessi insufficienti: effettua di nuovo il login.');
      err.authError = true;
      throw err;
    }
    throw new Error(body.errore || body.message || 'Operazione non riuscita.');
  }
  return body;
}

async function syncStateFromServer() {
  try {
    const response = await fetch(`${API_BASE}/state`);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    for (const [key, value] of Object.entries(data || {})) {
      if (key.startsWith('itsx.') && key !== 'itsx.session') {
        try { store.setItem(key, JSON.stringify(value)); } catch (_) {}
      }
    }
    serverReady = true;
  } catch (err) {
    console.warn('Backend non disponibile, avvio in modalità locale:', err);
    serverReady = false;
  }
}

// Carica i tornei REALI dal database MySQL tramite REST API.
// Ritorna true se la cache locale è cambiata.
async function loadTorneiFromServer() {
  try {
    const res = await fetch(API_BASE + '/tornei', { cache: 'no-store' });
    if (!res.ok) return false;
    const lista = await res.json();
    if (!Array.isArray(lista)) return false;
    const mapped = lista.map(function(t) { return {
      id: t.id, nome: t.nome || '', gioco: t.gioco || 'Altro',
      stato: t.stato || 'aperto', inizioIscrizioni: t.inizioIscrizioni || '',
      fineIscrizioni: t.fineIscrizioni || '', maxPartecipanti: t.maxPartecipanti || 0,
      iscritti: t.iscritti || 0, descrizione: t.descrizione || '',
      createdAt: t.createdAt || new Date().toISOString()
    }; });
    return saveIfChanged(KEY.tornei, mapped);
  } catch(err) { console.warn('loadTorneiFromServer fallito:', err); return false; }
}

// Scrive nello storage locale solo se il contenuto è diverso (evita render inutili)
function saveIfChanged(key, value) {
  const next = JSON.stringify(value);
  let prev = null;
  try { prev = store.getItem(key); } catch (_) {}
  if (prev === next) return false;
  try { store.setItem(key, next); } catch (_) {}
  return true;
}

// Iscrizioni REALI dal DB (tabella iscrizioni): una lista per torneo, poi unite nella cache locale.
async function loadIscrizioniFromServer() {
  try {
    const tornei = getTornei();
    const results = await Promise.all(tornei.map(async (t) => {
      const res = await fetch(`${API_BASE}/tornei/${t.id}/iscritti`, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return { t, rows: await res.json() };
    }));
    const iscr = [];
    const users = getUsers();
    let usersChanged = false;
    for (const { t, rows } of results) {
      for (const r of rows) {
        iscr.push({ id: `${t.id}:${r.id}`, torneoId: t.id, userId: r.id, data: r.iscrittoAl || new Date().toISOString() });
        if (!users.some((u) => same(u.id, r.id))) {
          users.push({ id: r.id, nome: r.nome, cognome: r.cognome, nickname: r.nickname || '', email: r.email, role: 'user', salt: '', hash: '', createdAt: r.iscrittoAl || new Date().toISOString() });
          usersChanged = true;
        }
      }
    }
    let changed = saveIfChanged(KEY.iscrizioni, iscr);
    if (usersChanged) { try { store.setItem(KEY.users, JSON.stringify(users)); } catch (_) {} changed = true; }
    return changed;
  } catch (err) { console.warn('loadIscrizioniFromServer fallito:', err); return false; }
}

// Impostazioni globali (limite di tornei per utente) dal DB.
// Admin: GET /api/admin/settings/max-tornei. Utente: GET /api/me/tornei/count (include il limite).
async function loadImpostazioniFromServer() {
  const me = currentUser();
  if (!me || !getToken()) return false;
  try {
    const data = me.role === 'admin'
      ? await apiRequest('/admin/settings/max-tornei')
      : await apiRequest('/me/tornei/count');
    const v = Number(data && data.maxTornei);
    if (!Number.isInteger(v) || v < 1) return false;
    return saveIfChanged(KEY.config, { maxTorneiPerUtente: v });
  } catch (err) { console.warn('loadImpostazioniFromServer fallito:', err); return false; }
}

// Statistiche homepage (GET /api/stats) e torneo in evidenza (GET /api/tornei/prossima-scadenza)
let serverStats = null;
let serverNext = null;
async function loadHomeFromServer() {
  try {
    const st = await fetch(API_BASE + '/stats', { cache: 'no-store' });
    const stats = st.ok ? await st.json() : null;
    const nx = await fetch(API_BASE + '/tornei/prossima-scadenza', { cache: 'no-store' });
    const next = nx.ok ? await nx.json() : null;
    const changed = JSON.stringify([stats, next]) !== JSON.stringify([serverStats, serverNext]);
    serverStats = stats; serverNext = next;
    return changed;
  } catch (err) { console.warn('loadHomeFromServer fallito:', err); return false; }
}

// Filtro stato del catalogo: GET /api/tornei?status={filtro}
const STATUS_PARAM = { aperto: 'aperti', in_corso: 'in_corso', chiuso: 'conclusi', cancellato: 'cancellati' };
let serverStatoIds = null;
async function loadStatoFilter(stato) {
  if (!stato || !serverReady || !STATUS_PARAM[stato]) { serverStatoIds = null; return; }
  try {
    const list = await fetch(`${API_BASE}/tornei?status=${STATUS_PARAM[stato]}`, { cache: 'no-store' }).then((r) => r.json());
    serverStatoIds = Array.isArray(list) ? new Set(list.map((t) => String(t.id))) : null;
  } catch (_) { serverStatoIds = null; }
}

// Utenti REALI dal DB: solo per l'admin
let serverUsers = null;
async function loadUtentiFromServer() {
  const me = currentUser();
  if (!me || me.role !== 'admin' || !getToken()) return false;
  try {
    const list = await apiRequest('/admin/utenti');
    if (!Array.isArray(list)) return false;
    const changed = JSON.stringify(list) !== JSON.stringify(serverUsers);
    serverUsers = list;
    return changed;
  } catch (err) { console.warn('loadUtentiFromServer fallito:', err); return false; }
}

// Riallinea tutto con il database. Ritorna true se qualcosa è cambiato.
let refreshing = null;
function refreshData() {
  if (!serverReady) return Promise.resolve(false);
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const a = await loadTorneiFromServer();
    const b = await loadIscrizioniFromServer();
    const c = await loadUtentiFromServer();
    const d = await loadImpostazioniFromServer();
    const e = await loadHomeFromServer();
    if (typeof filters !== 'undefined' && filters.stato) await loadStatoFilter(filters.stato);
    return a || b || c || d || e;
  })().finally(() => { refreshing = null; });
  return refreshing;
}

// Aggiornamento automatico: la homepage e la dashboard si riallineano al DB senza ricaricare la pagina
function userIsBusy() {
  if (modal.open) return true;
  const el = document.activeElement;
  return !!(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && el.closest('main'));
}
async function autoRefresh() {
  if (document.hidden || userIsBusy()) return;
  if (await refreshData() && !userIsBusy()) render(false);
}
setInterval(autoRefresh, 8000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) autoRefresh(); });
window.addEventListener('focus', autoRefresh);
