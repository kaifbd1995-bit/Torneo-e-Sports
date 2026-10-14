/* Sessione, regole di iscrizione, filtri e validazioni
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

function currentUser() {
  const id = read(KEY.session, null);
  if (!id) return null;
  const u = getUser(id);
  if (!u) store.removeItem(KEY.session);
  return u;
}
const resetUi = () => { ui.profileTab = 'attive'; ui.adminTab = 'tornei'; };
const startSession = (u) => { resetUi(); write(KEY.session, u.id); };
const endSession = () => { resetUi(); store.removeItem(KEY.session); store.removeItem('itsx.accessToken'); };

const countIscritti = (tid) => getIscrizioni().filter((i) => same(i.torneoId, tid)).length;
const isJoined = (uidv, tid) => getIscrizioni().some((i) => same(i.userId, uidv) && same(i.torneoId, tid));

/* ---- Limite di tornei contemporanei per utente (valore globale, deciso dall'admin) ---- */
const DEFAULT_MAX_TORNEI = 3;
const getMaxTornei = () => {
  const v = Number((read(KEY.config, {}) || {}).maxTorneiPerUtente);
  return Number.isInteger(v) && v >= 1 ? v : DEFAULT_MAX_TORNEI;
};
// Iscrizioni "attive" dell'utente: solo tornei ancora aperti o in corso
const activeIscrizioni = (uidv) => getIscrizioni().filter((i) => {
  if (!same(i.userId, uidv)) return false;
  const t = getTorneo(i.torneoId);
  return !!t && (t.stato === 'aperto' || t.stato === 'in_corso');
}).length;
function limitInfo(uidv) {
  const max = getMaxTornei();
  const n = activeIscrizioni(uidv);
  return { max, n, reached: n >= max };
}
const limitMsg = (max) => `Hai raggiunto il limite di ${max} ${max === 1 ? 'torneo contemporaneo' : 'tornei contemporanei'}: disiscriviti da un torneo per iscriverti a un altro.`;

function regInfo(t) {
  const n = countIscritti(t.id);
  const today = todayISO();
  let reason = '';
  if (t.stato === 'cancellato') reason = 'Torneo cancellato';
  else if (t.stato === 'chiuso') reason = 'Torneo concluso';
  else if (t.stato === 'in_corso') reason = 'Torneo già iniziato';
  else if (today < t.inizioIscrizioni) reason = `Iscrizioni dal ${fmtShort(t.inizioIscrizioni)}`;
  else if (today > t.fineIscrizioni) reason = 'Iscrizioni terminate';
  else if (n >= t.maxPartecipanti) reason = 'Posti esauriti';
  return { n, reason, canJoin: reason === '', full: n >= t.maxPartecipanti, left: Math.max(0, t.maxPartecipanti - n) };
}
const canLeave = (t) => t.stato === 'aperto';

function deadlineText(t) {
  if (t.stato !== 'aperto') return '';
  const today = todayISO();
  if (today < t.inizioIscrizioni) return `Iscrizioni dal ${fmtShort(t.inizioIscrizioni)}`;
  if (today > t.fineIscrizioni) return 'Iscrizioni terminate';
  const d = daysBetween(today, t.fineIscrizioni);
  if (d === 0) return 'Ultimo giorno per iscriversi!';
  if (d === 1) return 'Le iscrizioni chiudono domani';
  return `Le iscrizioni chiudono tra ${d} giorni`;
}

const gameOf = (t) => GIOCHI[t.gioco] || GIOCHI['Altro'];
// Logo del gioco: immagine in img/ (con ripiego su icona vettoriale se manca il file)
const gameIco = (g, label = '') => {
  const fallback = icon('gamepad', 'game-ico-fallback');
  if (!g.img) return fallback;
  return `<img class="game-ico" src="${g.img}" alt="${esc(label)}" loading="lazy" onerror="this.outerHTML=this.dataset.fb" data-fb="${esc(fallback)}">`;
};

const filters = { q: '', stato: '', gioco: '', sort: 'rilevanza' };
const adminFilters = { q: '', stato: '', gioco: '', sort: 'recenti' };

function filterTornei(list, f) {
  const q = f.q.trim().toLowerCase();
  const rank = { aperto: 0, in_corso: 1, chiuso: 2, cancellato: 3 };
  const sorters = {
    rilevanza: (a, b) => rank[a.stato] - rank[b.stato] || a.fineIscrizioni.localeCompare(b.fineIscrizioni),
    scadenza: (a, b) => a.fineIscrizioni.localeCompare(b.fineIscrizioni),
    recenti: (a, b) => b.createdAt.localeCompare(a.createdAt),
    nome: (a, b) => a.nome.localeCompare(b.nome, 'it'),
    posti: (a, b) => (b.maxPartecipanti - countIscritti(b.id)) - (a.maxPartecipanti - countIscritti(a.id))
  };
  return list
    .filter((t) =>
      (!q || `${t.nome} ${t.descrizione} ${t.gioco}`.toLowerCase().includes(q)) &&
      (!f.stato || t.stato === f.stato) &&
      (!f.gioco || t.gioco === f.gioco))
    .sort(sorters[f.sort] || sorters.rilevanza);
}

function validatePassword(pw) {
  if (pw.length < 8) return 'La password deve avere almeno 8 caratteri.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Usa almeno una lettera e un numero.';
  if (pw.length > 72) return 'La password può avere al massimo 72 caratteri.';
  return '';
}
function validateName(v, label) {
  if (v.length < 2 || v.length > 40) return `${label}: da 2 a 40 caratteri.`;
  if (!NAME_RE.test(v)) return `${label}: usa solo lettere, spazi, apostrofi o trattini.`;
  return '';
}
function strength(pw) {
  if (!pw) return { level: 0, label: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length < 8) s = Math.min(s, 1);
  const level = s <= 1 ? 1 : s === 2 ? 2 : s === 3 ? 3 : 4;
  return { level, label: ['', 'Debole', 'Discreta', 'Buona', 'Ottima'][level] };
}
const safeNext = (n) => (n && /^\/[A-Za-z0-9/_-]*$/.test(n) && !n.startsWith('//') ? n : '');
