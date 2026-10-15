
(() => {
  'use strict';

  

  const KEY = {
    users: 'itsx.users',
    tornei: 'itsx.tornei',
    iscrizioni: 'itsx.iscrizioni',
    session: 'itsx.session',
    seed: 'itsx.seed.v1',
    attesa: 'itsx.attesa',
    risultati: 'itsx.risultati'
  };

  const STATI = {
    aperto: { label: 'Aperto' },
    in_corso: { label: 'In corso' },
    chiuso: { label: 'Chiuso' },
    cancellato: { label: 'Cancellato' }
  };

  const GIOCHI = {
    'Valorant':         { hue: 350, img: 'img/valorant.jpg' },
    'League of Legends':{ hue: 215, img: 'img/lol.svg' },
    'Rocket League':    { hue: 190, img: 'img/rocketleague.jpg' },
    'FC 27':            { hue: 140, img: 'img/fc27.jpg' },
    'Counter-Strike 2': { hue: 35,  img: 'img/cs2.jpg' },
    'Fortnite':         { hue: 275, img: 'img/fortnite.jpg' },
    'Minecraft':        { hue: 105, img: 'img/minecraft.svg' },
    'Altro':            { hue: 255, img: '' }
  };

  const DEMO = {
    admin: { email: 'admin@itslazio.it', password: 'Admin123!' },
    user: { email: 'mario.rossi@example.com', password: 'Password123' }
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const NAME_RE = /^[\p{L}][\p{L}'’ .-]*$/u;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

  const uid = () =>
    (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => toISO(new Date());
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toISO(d); };
  const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const isISO = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && toISO(parseISO(s)) === s;
  const fmtDate = (s) => parseISO(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtShort = (s) => parseISO(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  const fmtStamp = (iso) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);

  const ICONS = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    gamepad: '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
  };
  const icon = (name, cls = '') =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  

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

  /* ---- Password: hash SHA-256 con salt (simulazione; in produzione serve un backend) ---- */
  async function hashPassword(password, salt) {
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; // fallback per contesti non sicuri
    for (const b of bytes) h = ((h << 5) + h + b) >>> 0;
    return 'fb' + h.toString(16);
  }

  async function makeUser({ nome, cognome, email, password, role = 'user' }) {
    const salt = uid();
    return {
      id: uid(),
      nome,
      cognome,
      email: email.toLowerCase(),
      salt,
      hash: await hashPassword(password, salt),
      role,
      createdAt: new Date().toISOString()
    };
  }

  async function seed(force = false) {
    if (!force && read(KEY.seed, false)) return;
    // Se il server è disponibile, NON sovrascrivere tornei e iscrizioni del DB
    const useServer = serverReady;

    const admin = await makeUser({ nome: 'Admin', cognome: 'ITS Lazio', email: DEMO.admin.email, password: DEMO.admin.password, role: 'admin' });

    const nomi = [
      ['Mario', 'Rossi'], ['Giulia', 'Bianchi'], ['Luca', 'Verdi'], ['Sofia', 'Romano'],
      ['Marco', 'Ferrari'], ['Chiara', 'Esposito'], ['Alessandro', 'Russo'], ['Martina', 'Colombo'],
      ['Davide', 'Ricci'], ['Elena', 'Marino'], ['Matteo', 'Greco']
    ];
    const players = [];
    for (const [nome, cognome] of nomi) {
      const email = nome === 'Mario' ? DEMO.user.email : `${nome}.${cognome}@example.com`;
      const u = await makeUser({ nome, cognome, email, password: DEMO.user.password });
      u.createdAt = new Date(Date.now() - (30 + players.length * 3) * 86400000).toISOString();
      players.push(u);
    }

    const stamp = (k) => new Date(Date.now() - k * 3600000).toISOString();
    const T = (k, o) => ({ id: uid(), createdAt: stamp(k), ...o });
    const tornei = [
      T(70, {
        nome: 'Valorant Campus Cup', gioco: 'Valorant', stato: 'aperto',
        inizioIscrizioni: addDays(-5), fineIscrizioni: addDays(10), maxPartecipanti: 16,
        descrizione: 'Il torneo 5v5 più atteso del campus. Fase a gironi seguita da eliminazione diretta al meglio dei tre round. Porta il tuo team (o formalo sul posto) e dimostra la tua mira. Premi per i primi tre classificati.'
      }),
      T(60, {
        nome: 'Rocket League 3v3 Showdown', gioco: 'Rocket League', stato: 'in_corso',
        inizioIscrizioni: addDays(-20), fineIscrizioni: addDays(-7), maxPartecipanti: 9,
        descrizione: 'Tre squadre da tre giocatori si sfidano in un girone all’italiana. Partite da 5 minuti, overtime a golden goal. Le partite si giocano ogni giovedì in aula E-Sports.'
      }),
      T(50, {
        nome: 'FC 27 Winter League', gioco: 'FC 27', stato: 'aperto',
        inizioIscrizioni: addDays(0), fineIscrizioni: addDays(20), maxPartecipanti: 32,
        descrizione: 'Campionato 1v1 a eliminazione diretta con squadre di club a scelta. Partite da 6 minuti per tempo, regolamento ufficiale. Il vincitore riceve la coppa del campus.'
      }),
      T(40, {
        nome: 'League of Legends Clash ITS', gioco: 'League of Legends', stato: 'chiuso',
        inizioIscrizioni: addDays(-60), fineIscrizioni: addDays(-40), maxPartecipanti: 10,
        descrizione: 'Torneo concluso: dieci invocatori, due squadre estratte a sorte per ogni round e una finale spettacolare trasmessa in diretta sul canale degli studenti.'
      }),
      T(30, {
        nome: 'Minecraft Build Battle', gioco: 'Minecraft', stato: 'cancellato',
        inizioIscrizioni: addDays(-30), fineIscrizioni: addDays(-10), maxPartecipanti: 20,
        descrizione: 'Gara di costruzione a tema "città del futuro". Torneo annullato per indisponibilità dei server: seguiranno aggiornamenti per una nuova edizione.'
      }),
      T(20, {
        nome: 'Counter-Strike 2 Invitational', gioco: 'Counter-Strike 2', stato: 'aperto',
        inizioIscrizioni: addDays(3), fineIscrizioni: addDays(14), maxPartecipanti: 10,
        descrizione: 'Torneo a inviti 5v5 sulle mappe competitive del pool attuale. Le iscrizioni apriranno tra pochi giorni: preparati a registrarti.'
      }),
      T(10, {
        nome: 'Fortnite Duo Rush', gioco: 'Fortnite', stato: 'aperto',
        inizioIscrizioni: addDays(-10), fineIscrizioni: addDays(0), maxPartecipanti: 8,
        descrizione: 'Sfida a coppie in cinque partite consecutive: vince chi accumula più punti tra eliminazioni e piazzamento. Ultimi posti disponibili, affrettati!'
      })
    ];

    const byName = (n) => tornei.find((t) => t.nome === n).id;
    const pick = (from, to) => players.slice(from, to + 1);
    const join = (tid, list, k) =>
      list.map((u, i) => ({ id: uid(), torneoId: tid, userId: u.id, data: stamp(k * 10 + (list.length - i)) }));

    const iscrizioni = [
      ...join(byName('Valorant Campus Cup'), pick(0, 8), 2),
      ...join(byName('Rocket League 3v3 Showdown'), pick(0, 8), 5),
      ...join(byName('FC 27 Winter League'), pick(2, 6), 1),
      ...join(byName('League of Legends Clash ITS'), pick(0, 7), 12),
      ...join(byName('Minecraft Build Battle'), pick(3, 5), 8),
      ...join(byName('Fortnite Duo Rush'), pick(4, 9), 3)
    ];

    setUsers([admin, ...players]);
    if (!useServer) {
      setTornei(tornei);
      setIscrizioni(iscrizioni);
    }
    write(KEY.seed, true);
  }

   

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

  function toast(message, type = 'ok') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', type === 'err' ? 'alert' : 'status');
    el.innerHTML = `${icon(type === 'err' ? 'alert' : 'check')}<span>${esc(message)}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 300);
    }, 3800);
  }

  const modal = $('#modal');
  function openModal(html, size = 'md') {
    modal.className = `modal modal-${size}`;
    modal.innerHTML = html;
    if (!modal.open) modal.showModal();
  }
  function closeModal() {
    if (modal.open) modal.close();
    modal.innerHTML = '';
  }
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modal.addEventListener('close', () => { modal.innerHTML = ''; });

  const modalHead = (title, id = 'm-title') =>
    `<div class="modal-head"><h2 id="${id}">${title}</h2>
       <button type="button" class="btn-icon" data-action="close-modal" aria-label="Chiudi">${icon('x')}</button></div>`;

  function confirmDialog({ title, message, confirmLabel = 'Conferma', danger = false }) {
    return new Promise((resolve) => {
      openModal(`
        ${modalHead(esc(title))}
        <div class="modal-body"><p>${message}</p></div>
        <div class="modal-foot">
          <button type="button" class="btn btn-ghost" data-no>Annulla</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(confirmLabel)}</button>
        </div>`, 'sm');
      let done = false;
      const finish = (v) => {
        if (done) return;
        done = true;
        modal.removeEventListener('close', onClose);
        closeModal();
        resolve(v);
      };
      const onClose = () => finish(false);
      modal.addEventListener('close', onClose);
      $('[data-yes]', modal).onclick = () => finish(true);
      $('[data-no]', modal).onclick = () => finish(false);
    });
  }

  function field({ name, label, type = 'text', value = '', required = true, autocomplete = '', hint = '', attrs = '' }) {
    const id = `f_${name}`;
    return `<div class="field" data-field="${name}">
      <label for="${id}">${label}${required ? '' : ' <span class="opt">(opzionale)</span>'}</label>
      <div class="input-wrap">
        <input id="${id}" name="${name}" type="${type}" value="${esc(value)}" ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${attrs} aria-describedby="${id}_e">
        ${type === 'password' ? `<button type="button" class="pw-toggle" data-action="toggle-pw" aria-label="Mostra password">${icon('eye')}</button>` : ''}
      </div>
      ${hint ? `<p class="hint">${hint}</p>` : ''}
      <p class="error" id="${id}_e" role="alert"></p>
    </div>`;
  }
  function selectField({ name, label, options, value = '', attrs = '' }) {
    const id = `f_${name}`;
    return `<div class="field" data-field="${name}">
      <label for="${id}">${label}</label>
      <select id="${id}" name="${name}" ${attrs} aria-describedby="${id}_e">
        ${options.map(([v, l]) => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(l)}</option>`).join('')}
      </select>
      <p class="error" id="${id}_e" role="alert"></p>
    </div>`;
  }
  function textareaField({ name, label, value = '', attrs = '', hint = '' }) {
    const id = `f_${name}`;
    return `<div class="field" data-field="${name}">
      <label for="${id}">${label}</label>
      <textarea id="${id}" name="${name}" rows="5" ${attrs} aria-describedby="${id}_e">${esc(value)}</textarea>
      ${hint ? `<p class="hint">${hint}</p>` : ''}
      <p class="error" id="${id}_e" role="alert"></p>
    </div>`;
  }

  function setErrors(form, errors) {
    $$('.field', form).forEach((f) => {
      const msg = errors[f.dataset.field] || '';
      $('.error', f).textContent = msg;
      f.classList.toggle('invalid', !!msg);
      const input = $('input, select, textarea', f);
      if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    });
    const first = Object.keys(errors)[0];
    if (first) {
      const el = $(`[name="${first}"]`, form);
      if (el) el.focus();
    }
    return Object.keys(errors).length === 0;
  }

  const badge = (stato) =>
    `<span class="badge badge-${stato}"><span class="dot"></span>${esc(STATI[stato]?.label || stato)}</span>`;

  function progress(n, max) {
    const p = Math.min(100, Math.round((n / max) * 100));
    const cls = p >= 100 ? 'full' : p >= 80 ? 'hot' : '';
    return `<div class="progress ${cls}" role="progressbar" aria-label="Posti occupati" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${n}"><span style="width:${p}%"></span></div>`;
  }

  const initials = (u) => `${u.nome[0] || ''}${u.cognome[0] || ''}`.toUpperCase();

  function actionBtn(t, extra = '') {
    const me = currentUser();
    if (me && me.role === 'admin') return '';
    const big = extra.includes('btn-lg');
    if (me && isJoined(me.id, t.id)) {
      return canLeave(t)
        ? `<button type="button" class="btn btn-outline ${extra}" data-action="leave" data-id="${t.id}">Disiscriviti</button>`
        : `<span class="pill pill-ok">${icon('check')} Sei iscritto</span>`;
    }
    const r = regInfo(t);
    if (r.canJoin) {
      return me
        ? `<button type="button" class="btn btn-primary ${extra}" data-action="join" data-id="${t.id}">Iscriviti</button>`
        : `<a class="btn btn-primary ${extra}" href="#/login?next=/torneo/${t.id}">${big ? 'Accedi per iscriverti' : 'Iscriviti'}</a>`;
    }
    if (r.full && t.stato === 'aperto' && todayISO() >= t.inizioIscrizioni && todayISO() <= t.fineIscrizioni) {
      if (!me) return `<a class="btn btn-outline ${extra}" href="#/login?next=/torneo/${t.id}">Accedi per lista d’attesa</a>`;
      const queued = getAttesa().some(q => same(q.userId, me.id) && same(q.torneoId, t.id));
      return queued ? `<span class="pill pill-muted">In lista d’attesa</span>` : `<button type="button" class="btn btn-outline ${extra}" data-action="waitlist" data-id="${t.id}">Entra in lista d’attesa</button>`;
    }
    return `<span class="pill pill-muted">${esc(r.reason)}</span>`;
  }

  function cardHTML(t) {
    const r = regInfo(t);
    const g = gameOf(t);
    const hint = deadlineText(t);
    const bannerContent = g.img
      ? `<img src="${g.img}" alt="${esc(t.gioco)}" class="t-banner-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <span class="t-banner-fallback" style="display:none"><span class="t-emoji" aria-hidden="true">${icon('gamepad')}</span></span>`
      : `<span class="t-emoji" aria-hidden="true">${icon('gamepad')}</span>`;
    return `<article class="card t-card" style="--h:${g.hue}">
      <a class="t-banner" href="#/torneo/${t.id}" aria-label="Apri ${esc(t.nome)}">
        ${bannerContent}
        <div class="t-banner-overlay">
          <span class="t-game">${esc(t.gioco)}</span>
          ${badge(t.stato)}
        </div>
      </a>
      <div class="t-body">
        <h3><a href="#/torneo/${t.id}">${esc(t.nome)}</a></h3>
        <p class="t-desc">${esc(t.descrizione)}</p>
        <ul class="t-meta">
          <li>${icon('calendar')}<span>Iscrizioni ${esc(fmtShort(t.inizioIscrizioni))} – ${esc(fmtShort(t.fineIscrizioni))}</span></li>
          <li>${icon('users')}<span>${r.n}/${t.maxPartecipanti} iscritti</span></li>
        </ul>
        ${progress(r.n, t.maxPartecipanti)}
        <div class="t-foot">
          <span class="t-hint">${hint ? icon('clock') + esc(hint) : ''}</span>
          <div class="t-actions">
            <a class="btn btn-ghost btn-sm" href="#/torneo/${t.id}">Dettagli</a>
            ${actionBtn(t, 'btn-sm')}
          </div>
        </div>
      </div>
    </article>`;
  }

  const emptyBox = (title, text, extra = '') =>
    `<div class="empty"><div class="empty-ico">${icon('trophy')}</div><h3>${title}</h3><p>${text}</p>${extra}</div>`;


  function viewHome() {
    const all = getTornei();
    const me = currentUser();
    const inCorso = all.filter((t) => t.stato === 'in_corso');
    const aperti = all
      .filter((t) => t.stato === 'aperto')
      .sort((a, b) => a.fineIscrizioni.localeCompare(b.fineIscrizioni));
    const players = getUsers().filter((u) => u.role !== 'admin' && (!serverReady || typeof u.id === 'number')).length;
    const iscritti = getIscrizioni().filter((i) => getTorneo(i.torneoId)).length;
    const next = aperti.find((t) => regInfo(t).canJoin);

    const heroPanel = next
      ? (() => {
          const r = regInfo(next);
          const g = gameOf(next);
          return `<div class="hero-panel card" style="--h:${g.hue}">
            <p class="panel-label">${icon('clock')} Prossima scadenza</p>
            <div class="panel-game"><span class="panel-emoji" aria-hidden="true">${gameIco(g)}</span>
              <div><h3>${esc(next.nome)}</h3><p>${esc(next.gioco)}</p></div></div>
            ${progress(r.n, next.maxPartecipanti)}
            <div class="panel-row"><span>${r.left} ${r.left === 1 ? 'posto libero' : 'posti liberi'}</span><strong>${esc(deadlineText(next))}</strong></div>
            <a class="btn btn-primary btn-block" href="#/torneo/${next.id}">Vedi il torneo ${icon('arrow')}</a>
          </div>`;
        })()
      : `<div class="hero-panel card">${emptyBox('Nessuna iscrizione aperta', 'Torna presto: nuovi tornei in arrivo.')}</div>`;

    const secondary = !me
      ? `<a class="btn btn-ghost btn-lg" href="#/registrati">Crea il tuo profilo</a>`
      : me.role === 'admin'
        ? `<a class="btn btn-ghost btn-lg" href="#/admin">Dashboard admin</a>`
        : `<a class="btn btn-ghost btn-lg" href="#/profilo">Il mio profilo</a>`;

    const section = (id, titleHtml, sub, list, emptyHtml) => `
      <section class="section container" aria-labelledby="${id}">
        <div class="section-head">
          <div><h2 id="${id}">${titleHtml}</h2><p>${sub}</p></div>
          <a class="link-arrow" href="#/tornei">Tutti i tornei ${icon('arrow')}</a>
        </div>
        ${list.length ? `<div class="grid">${list.map(cardHTML).join('')}</div>` : emptyHtml}
      </section>`;

    const html = `
      <section class="hero">
        <div class="orbs" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="container hero-inner">
          <div class="hero-copy">
            <p class="eyebrow">${icon('trophy')} ITS Lazio Digital · E-Sports</p>
            <h1>Entra in gioco.<br><span class="grad">Conquista il campus.</span></h1>
            <p class="lead">Consulta i tornei in corso, iscriviti a quelli con le iscrizioni aperte e segui il tuo percorso da giocatore. Tutto in un unico portale.</p>
            <div class="hero-actions">
              <a class="btn btn-primary btn-lg" href="#/tornei">Esplora i tornei ${icon('arrow')}</a>
              ${secondary}
            </div>
          </div>
          ${heroPanel}
        </div>
      </section>

      <section class="container" aria-label="Statistiche">
        <div class="stats">
          <div class="stat"><span class="stat-num">${aperti.length}</span><span class="stat-label">Iscrizioni aperte</span></div>
          <div class="stat"><span class="stat-num">${inCorso.length}</span><span class="stat-label">Tornei in corso</span></div>
          <div class="stat"><span class="stat-num">${players}</span><span class="stat-label">Giocatori registrati</span></div>
          <div class="stat"><span class="stat-num">${iscritti}</span><span class="stat-label">Iscrizioni totali</span></div>
        </div>
      </section>

      ${section('h-corso', '<span class="live-dot" aria-hidden="true"></span> Tornei in corso', 'Si stanno giocando adesso.', inCorso,
        emptyBox('Nessun torneo in corso', 'Al momento non ci sono tornei in svolgimento.'))}

      ${section('h-aperti', 'Iscrizioni aperte', 'Scegli il tuo torneo e iscriviti prima che i posti finiscano.', aperti,
        emptyBox('Nessun torneo con iscrizioni aperte', 'Nuovi tornei saranno pubblicati a breve.'))}

      <section class="section container" aria-labelledby="h-how">
        <div class="section-head"><div><h2 id="h-how">Come funziona</h2><p>Tre passi per scendere in campo.</p></div></div>
        <ol class="steps">
          <li class="step"><span class="step-n">1</span><h3>Registrati</h3><p>Crea il tuo account con nome, cognome, email e password. Ci vogliono meno di un minuto.</p></li>
          <li class="step"><span class="step-n">2</span><h3>Scegli il torneo</h3><p>Sfoglia i tornei aperti, leggi la descrizione e controlla i posti ancora disponibili.</p></li>
          <li class="step"><span class="step-n">3</span><h3>Gioca</h3><p>Iscriviti con un click. Cambi idea? Ti puoi disiscrivere finché il torneo è aperto.</p></li>
        </ol>
      </section>

      ${me ? '' : `
      <section class="container section">
        <div class="cta-band">
          <div><h2>Pronto a scendere in campo?</h2><p>Registrati gratis e iscriviti al tuo primo torneo.</p></div>
          <a class="btn btn-primary btn-lg" href="#/registrati">Registrati ora</a>
        </div>
      </section>`}`;

    return { title: 'Home', html };
  }

  function toolbar(scope, f, games) {
    return `<div class="toolbar" role="search">
      <label class="search"><span class="sr-only">Cerca</span>${icon('search')}
        <input type="search" placeholder="Cerca per nome, gioco o descrizione…" value="${esc(f.q)}" data-filter="${scope}.q"></label>
      <label class="select-wrap"><span class="sr-only">Stato</span>
        <select data-filter="${scope}.stato">
          <option value="">Tutti gli stati</option>
          ${Object.entries(STATI).map(([k, v]) => `<option value="${k}" ${f.stato === k ? 'selected' : ''}>${v.label}</option>`).join('')}
        </select></label>
      <label class="select-wrap"><span class="sr-only">Gioco</span>
        <select data-filter="${scope}.gioco">
          <option value="">Tutti i giochi</option>
          ${games.map((g) => `<option value="${esc(g)}" ${f.gioco === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}
        </select></label>
      <label class="select-wrap"><span class="sr-only">Ordina per</span>
        <select data-filter="${scope}.sort">
          ${[['rilevanza', 'Rilevanza'], ['scadenza', 'Scadenza iscrizioni'], ['recenti', 'Più recenti'], ['nome', 'Nome A–Z'], ['posti', 'Posti disponibili']]
            .map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select></label>
    </div>`;
  }
  const gamesList = () => [...new Set([...Object.keys(GIOCHI).filter((g) => g !== 'Altro'), ...getTornei().map((t) => t.gioco)])].sort();

  function viewTornei() {
    return {
      title: 'Tornei',
      html: `<section class="container page-head">
        <p class="eyebrow">${icon('trophy')} Catalogo</p>
        <h1>Tutti i tornei</h1>
        <p class="lead">Aperti, in corso o già conclusi: consulta tutto senza bisogno di registrarti.</p>
        ${toolbar('pub', filters, gamesList())}
        <p class="result-count" id="count" aria-live="polite"></p>
        <div class="grid" id="grid"></div>
      </section>`,
      after: updateGrid
    };
  }
  function updateGrid() {
    const grid = $('#grid');
    if (!grid) return;
    const list = filterTornei(getTornei(), filters);
    grid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : `<div class="wide">${emptyBox('Nessun torneo trovato', 'Prova a cambiare i filtri di ricerca.',
          '<button type="button" class="btn btn-ghost" data-action="reset-filters">Azzera filtri</button>')}</div>`;
    $('#count').textContent = `${list.length} ${list.length === 1 ? 'torneo' : 'tornei'}`;
  }

  function viewTorneo(id) {
    const t = getTorneo(id);
    if (!t) return viewNotFound('Torneo non trovato', 'Il torneo che cerchi non esiste o è stato eliminato.');
    const me = currentUser();
    const r = regInfo(t);
    const g = gameOf(t);
    const hint = deadlineText(t);

    let note = '';
    if (!me) note = `<p class="side-note">Non hai un account? <a href="#/registrati">Registrati</a> oppure <a href="#/login?next=/torneo/${t.id}">accedi</a>.</p>`;
    else if (me.role === 'admin') note = `<p class="side-note">Sei un amministratore: gestisci questo torneo dalla <a href="#/admin">dashboard</a>.</p>`;
    else if (isJoined(me.id, t.id) && !canLeave(t)) note = `<p class="side-note">Risulti iscritto a questo torneo.</p>`;

    const html = `
      <section class="container detail">
        <nav class="crumbs" aria-label="Percorso"><a href="#/tornei">Tornei</a><span aria-hidden="true">/</span><span>${esc(t.nome)}</span></nav>

        <header class="detail-hero card" style="--h:${g.hue}">
          <div class="dh-emoji" aria-hidden="true">${gameIco(g)}</div>
          <div>
            <div class="dh-tags">${badge(t.stato)}<span class="pill">${esc(t.gioco)}</span></div>
            <h1>${esc(t.nome)}</h1>
            ${hint ? `<p class="dh-hint">${icon('clock')} ${esc(hint)}</p>` : ''}
          </div>
        </header>

        <div class="detail-grid">
          <div class="detail-main">
            <article class="card pad"><h2>Descrizione</h2><p class="prewrap">${esc(t.descrizione)}</p></article>
            <article class="card pad"><h2>Informazioni</h2>
              <dl class="info-list">
                <div><dt>Stato</dt><dd>${badge(t.stato)}</dd></div>
                <div><dt>Gioco</dt><dd>${esc(t.gioco)}</dd></div>
                <div><dt>Apertura iscrizioni</dt><dd>${esc(fmtDate(t.inizioIscrizioni))}</dd></div>
                <div><dt>Chiusura iscrizioni</dt><dd>${esc(fmtDate(t.fineIscrizioni))}</dd></div>
                <div><dt>Massimo partecipanti</dt><dd>${t.maxPartecipanti}</dd></div>
                <div><dt>Iscritti</dt><dd>${r.n}</dd></div>
              </dl>
            </article>
          </div>
          <aside class="detail-side">
            <div class="card pad join-panel">
              <p class="panel-label">${icon('users')} Posti</p>
              <p class="big-count"><strong>${r.n}</strong><span> / ${t.maxPartecipanti}</span></p>
              ${progress(r.n, t.maxPartecipanti)}
              <p class="muted">${r.left} ${r.left === 1 ? 'posto disponibile' : 'posti disponibili'}</p>
              <div class="join-action">${actionBtn(t, 'btn-lg btn-block')}</div>
              ${note}
            </div>
          </aside>
        </div>
      </section>`;
    return { title: t.nome, html };
  }

  function viewCalendario() {
    const events = getTornei().filter(t => t.stato !== 'cancellato').map(t => ({ ...t, eventDate: t.dataPartita || t.fineIscrizioni }))
      .sort((a,b) => a.eventDate.localeCompare(b.eventDate));
    const grouped = events.reduce((acc,t) => { (acc[t.eventDate] ||= []).push(t); return acc; }, {});
    return { title: 'Calendario partite', html: `<section class="container page-head"><div class="section-head"><div><p class="eyebrow">PROGRAMMA</p><h1>Calendario <span class="gradient-text">partite</span></h1><p class="muted">Consulta le date dei tornei e apri le schede per tutti i dettagli.</p></div></div>
      <div class="calendar-list">${Object.keys(grouped).length ? Object.entries(grouped).map(([date,items]) => `<section class="card calendar-day"><div class="calendar-date"><strong>${esc(fmtShort(date))}</strong><span>${esc(fmtDate(date))}</span></div><div class="calendar-events">${items.map(t => `<article class="calendar-event"><span class="calendar-emoji">${gameIco(gameOf(t))}</span><div class="calendar-event-main"><h3><a href="#/torneo/${t.id}">${esc(t.nome)}</a></h3><p>${esc(t.gioco)} · ${badge(t.stato)}</p><small>${t.dataPartita ? 'Data partita' : 'Data indicativa: chiusura iscrizioni'}</small></div><a class="btn btn-ghost btn-sm" href="#/torneo/${t.id}">Dettagli</a></article>`).join('')}</div></section>`).join('') : emptyBox('Nessuna partita in calendario','I tornei appariranno qui quando saranno disponibili.')}</div></section>` };
  }

  function viewRisultati() {
    const results = getRisultati().map(r => ({...r, torneo:getTorneo(r.torneoId)})).filter(r => r.torneo).sort((a,b) => b.data.localeCompare(a.data));
    const standings = {};
    results.forEach(r => { standings[r.vincitore] = (standings[r.vincitore] || 0) + 3; standings[r.secondo] = (standings[r.secondo] || 0) + 1; });
    const ranking = Object.entries(standings).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
    const me = currentUser();
    const adminForm = me && me.role === 'admin' ? `<section class="card pad result-entry"><h2>Registra un risultato</h2><p class="muted">Inserisci il podio e il punteggio finale. I punti classifica vengono aggiornati automaticamente (3 al vincitore, 1 al secondo).</p><form data-form="result-entry"><div class="form-grid"><div class="field"><label for="result-torneo">Torneo</label><select id="result-torneo" name="torneoId" required>${getTornei().filter(t=>t.stato!=='cancellato').map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></div><div class="field"><label for="result-winner">Vincitore / squadra</label><input id="result-winner" name="vincitore" required maxlength="80"></div><div class="field"><label for="result-second">Secondo classificato</label><input id="result-second" name="secondo" required maxlength="80"></div><div class="field"><label for="result-score">Punteggio finale</label><input id="result-score" name="punteggio" required maxlength="30" placeholder="es. 13–9"></div></div><button class="btn btn-primary" type="submit">Salva risultato</button></form></section>` : '';
    return { title:'Risultati e classifica', html:`<section class="container page-head"><div class="section-head"><div><p class="eyebrow">COMPETIZIONE</p><h1>Risultati <span class="gradient-text">e classifica</span></h1><p class="muted">Risultati ufficiali inseriti dagli amministratori e classifica cumulativa.</p></div></div>${adminForm}<div class="results-grid"><section class="card pad"><h2>Ultimi risultati</h2>${results.length ? `<div class="result-list">${results.map(r=>`<article class="result-row"><div class="result-trophy">${icon('trophy')}</div><div class="result-main"><h3>${esc(r.torneo.nome)}</h3><p><strong>${esc(r.vincitore)}</strong> <span class="muted">ha vinto contro</span> ${esc(r.secondo)}</p><small>${esc(fmtStamp(r.data))}</small></div><span class="score-pill">${esc(r.punteggio)}</span></article>`).join('')}</div>` : emptyBox('Nessun risultato pubblicato','Gli amministratori possono registrare i risultati dei tornei conclusi.')}</section><section class="card pad"><h2>Classifica generale</h2>${ranking.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Giocatore / squadra</th><th>Punti</th></tr></thead><tbody>${ranking.map(([name,pts],i)=>`<tr><td><span class="rank-number">${i+1}</span></td><td>${esc(name)}</td><td><strong>${pts}</strong></td></tr>`).join('')}</tbody></table></div>` : emptyBox('Classifica non disponibile','La classifica si popola dopo la pubblicazione dei primi risultati.')}</section></div></section>` };
  }

  function viewAttesa() {
    const me = currentUser(); const queue = getAttesa().filter(q => same(q.userId, me.id)).sort((a,b)=>a.data.localeCompare(b.data));
    return { title:'La mia lista d’attesa', html:`<section class="container page-head"><div class="section-head"><div><p class="eyebrow">POSTI ESAURITI?</p><h1>Lista <span class="gradient-text">d’attesa</span></h1><p class="muted">Se si libera un posto, il primo in coda viene promosso automaticamente.</p></div></div>${queue.length ? `<div class="my-list">${queue.map((q,i)=>{const t=getTorneo(q.torneoId);return t?`<article class="my-item"><span class="my-emoji">${gameIco(gameOf(t))}</span><div class="my-main"><h3><a href="#/torneo/${t.id}">${esc(t.nome)}</a></h3><p class="muted">Posizione in coda: ${getAttesa().filter(x=>x.torneoId===t.id).sort((a,b)=>a.data.localeCompare(b.data)).findIndex(x=>x.id===q.id)+1} · inserito il ${esc(fmtStamp(q.data))}</p></div><button class="btn btn-outline btn-sm" data-action="leave-waitlist" data-id="${t.id}">Lascia lista</button></article>`:''}).join('')}</div>` : emptyBox('Non sei in lista d’attesa','Quando un torneo è al completo puoi entrare in coda dalla sua scheda.','<a class="btn btn-primary" href="#/tornei">Esplora i tornei</a>')}</section>` };
  }

  function viewNotFound(title = 'Pagina non trovata', text = 'L’indirizzo che hai aperto non esiste.') {
    return {
      title,
      html: `<section class="container page-head center">${emptyBox(esc(title), esc(text),
        '<a class="btn btn-primary" href="#/">Torna alla home</a>')}</section>`
    };
  }

  function viewLogin(query) {
    const next = safeNext(query.get('next'));
    return {
      title: 'Accedi',
      html: `<section class="container auth-wrap">
        <div class="card auth-card">
          <div class="auth-head"><div class="auth-ico">${icon('user')}</div><h1>Bentornato</h1><p>Accedi per iscriverti ai tornei e vedere il tuo profilo.</p></div>
          <form data-form="login" novalidate>
            ${field({ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', attrs: 'autofocus placeholder="nome@esempio.it"' })}
            ${field({ name: 'password', label: 'Password', type: 'password', autocomplete: 'current-password', attrs: 'placeholder="••••••••"' })}
            <button class="btn btn-primary btn-block btn-lg" type="submit">Accedi</button>
          </form>
          <p class="auth-switch">Non hai un account? <a href="#/registrati${next ? `?next=${next}` : ''}">Registrati</a></p>
          <details class="demo-box">
            <summary>Account demo per provare il portale</summary>
            <div class="demo-actions">
              <button type="button" class="btn btn-ghost btn-sm" data-action="fill-demo" data-id="user">Compila utente</button>
              <button type="button" class="btn btn-ghost btn-sm" data-action="fill-demo" data-id="admin">Compila admin</button>
            </div>
            <p class="hint">Utente: ${esc(DEMO.user.email)} / ${esc(DEMO.user.password)}<br>Admin: ${esc(DEMO.admin.email)} / ${esc(DEMO.admin.password)}</p>
          </details>
        </div>
      </section>`
    };
  }

  function viewRegister(query) {
    const next = safeNext(query.get('next'));
    return {
      title: 'Registrati',
      html: `<section class="container auth-wrap">
        <div class="card auth-card wide">
          <div class="auth-head"><div class="auth-ico">${icon('shield')}</div><h1>Crea il tuo account</h1><p>Bastano pochi dati per iscriverti ai tornei.</p></div>
          <form data-form="register" novalidate>
            <div class="form-grid">
              ${field({ name: 'nome', label: 'Nome', autocomplete: 'given-name', attrs: 'autofocus maxlength="40"' })}
              ${field({ name: 'cognome', label: 'Cognome', autocomplete: 'family-name', attrs: 'maxlength="40"' })}
            </div>
            ${field({ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', attrs: 'placeholder="nome@esempio.it"' })}
            <div class="form-grid">
              <div>
                ${field({ name: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', hint: 'Minimo 8 caratteri, con almeno una lettera e un numero.' })}
                <div class="strength" id="strength" data-level="0" aria-live="polite"><span></span><span></span><span></span><span></span><em></em></div>
              </div>
              ${field({ name: 'password2', label: 'Conferma password', type: 'password', autocomplete: 'new-password' })}
            </div>
            <input type="hidden" name="next" value="${esc(next)}">
            <button class="btn btn-primary btn-block btn-lg" type="submit">Crea account</button>
          </form>
          <p class="auth-switch">Hai già un account? <a href="#/login${next ? `?next=${next}` : ''}">Accedi</a></p>
        </div>
      </section>`
    };
  }

  const ui = { profileTab: 'attive', adminTab: 'tornei' };

  function viewProfilo() {
    const me = currentUser();
    const mine = getIscrizioni()
      .filter((i) => same(i.userId, me.id))
      .map((i) => ({ i, t: getTorneo(i.torneoId) }))
      .filter((x) => x.t)
      .sort((a, b) => b.i.data.localeCompare(a.i.data));
    const attive = mine.filter((x) => x.t.stato === 'aperto' || x.t.stato === 'in_corso');
    const storico = mine.filter((x) => x.t.stato === 'chiuso' || x.t.stato === 'cancellato');
    const conclusi = storico.filter((x) => x.t.stato === 'chiuso').length;

    const row = ({ i, t }) => {
      const g = gameOf(t);
      return `<li class="my-item" style="--h:${g.hue}">
        <span class="my-emoji" aria-hidden="true">${gameIco(g)}</span>
        <div class="my-main">
          <h3><a href="#/torneo/${t.id}">${esc(t.nome)}</a></h3>
          <p class="muted">${esc(t.gioco)} · iscritto il ${esc(fmtStamp(i.data))}</p>
        </div>
        <div class="my-side">${badge(t.stato)}
          ${canLeave(t) ? `<button type="button" class="btn btn-outline btn-sm" data-action="leave" data-id="${t.id}">Disiscriviti</button>` : ''}
        </div>
      </li>`;
    };
    const list = ui.profileTab === 'attive' ? attive : storico;

    const html = `
      <section class="container page-head">
        <div class="profile-head card">
          <div class="avatar xl" aria-hidden="true">${esc(initials(me))}</div>
          <div class="profile-id">
            <h1>${esc(me.nome)} ${esc(me.cognome)}</h1>
            <p class="muted">${esc(me.email)} · iscritto dal ${esc(fmtStamp(me.createdAt))}</p>
          </div>
          <button type="button" class="btn btn-ghost" data-action="edit-profile">${icon('settings')} Modifica profilo</button>
        </div>

        <div class="stats stats-3">
          <div class="stat"><span class="stat-num">${attive.length}</span><span class="stat-label">Iscrizioni attive</span></div>
          <div class="stat"><span class="stat-num">${conclusi}</span><span class="stat-label">Tornei conclusi</span></div>
          <div class="stat"><span class="stat-num">${mine.length}</span><span class="stat-label">Iscrizioni totali</span></div>
        </div>

        <div class="tabs" role="tablist" aria-label="I miei tornei">
          <button type="button" role="tab" class="tab ${ui.profileTab === 'attive' ? 'active' : ''}" aria-selected="${ui.profileTab === 'attive'}" data-action="tab" data-id="attive">Iscrizioni attive <span class="count">${attive.length}</span></button>
          <button type="button" role="tab" class="tab ${ui.profileTab === 'storico' ? 'active' : ''}" aria-selected="${ui.profileTab === 'storico'}" data-action="tab" data-id="storico">Storico <span class="count">${storico.length}</span></button>
        </div>

        ${list.length
          ? `<ul class="my-list">${list.map(row).join('')}</ul>`
          : emptyBox(ui.profileTab === 'attive' ? 'Nessuna iscrizione attiva' : 'Nessun torneo nello storico',
              ui.profileTab === 'attive' ? 'Sfoglia i tornei e iscriviti al tuo primo.' : 'I tornei conclusi o cancellati a cui eri iscritto compariranno qui.',
              '<a class="btn btn-primary" href="#/tornei">Esplora i tornei</a>')}
      </section>`;
    return { title: 'Il mio profilo', html };
  }

  function openProfileForm() {
    const me = currentUser();
    openModal(`
      ${modalHead('Modifica profilo')}
      <form data-form="profile" novalidate>
        <div class="modal-body">
          <div class="form-grid">
            ${field({ name: 'nome', label: 'Nome', value: me.nome, autocomplete: 'given-name', attrs: 'maxlength="40"' })}
            ${field({ name: 'cognome', label: 'Cognome', value: me.cognome, autocomplete: 'family-name', attrs: 'maxlength="40"' })}
          </div>
          <p class="hint">Email: <strong>${esc(me.email)}</strong> (non modificabile)</p>
          <fieldset class="fieldset"><legend>Cambia password (facoltativo)</legend>
            ${field({ name: 'current', label: 'Password attuale', type: 'password', required: false, autocomplete: 'current-password' })}
            <div class="form-grid">
              ${field({ name: 'password', label: 'Nuova password', type: 'password', required: false, autocomplete: 'new-password' })}
              ${field({ name: 'password2', label: 'Conferma nuova', type: 'password', required: false, autocomplete: 'new-password' })}
            </div>
          </fieldset>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-ghost" data-action="close-modal">Annulla</button>
          <button type="submit" class="btn btn-primary">Salva modifiche</button>
        </div>
      </form>`);
  }

  function viewAdmin() {
    const tornei = getTornei();
    const users = (serverReady && serverUsers ? serverUsers : getUsers()).filter((u) => u.role !== 'admin');
    const iscr = getIscrizioni().filter((i) => getTorneo(i.torneoId));

    const html = `
      <section class="container page-head">
        <div class="admin-head">
          <div>
            <p class="eyebrow">${icon('shield')} Area riservata</p>
            <h1>Dashboard admin</h1>
            <p class="lead">Crea e gestisci i tornei, controlla gli iscritti.</p>
          </div>
          <div class="admin-actions">
            <button type="button" class="btn btn-ghost" data-action="reset-demo">${icon('refresh')} Ripristina dati demo</button>
            <button type="button" class="btn btn-primary btn-lg" data-action="admin-new">${icon('plus')} Nuovo torneo</button>
          </div>
        </div>

        <div class="stats">
          <div class="stat"><span class="stat-num">${tornei.length}</span><span class="stat-label">Tornei totali</span></div>
          <div class="stat"><span class="stat-num">${tornei.filter((t) => t.stato === 'aperto').length}</span><span class="stat-label">Aperti</span></div>
          <div class="stat"><span class="stat-num">${tornei.filter((t) => t.stato === 'in_corso').length}</span><span class="stat-label">In corso</span></div>
          <div class="stat"><span class="stat-num">${iscr.length}</span><span class="stat-label">Iscrizioni totali</span></div>
        </div>

        <div class="tabs" role="tablist" aria-label="Sezioni dashboard">
          <button type="button" role="tab" class="tab ${ui.adminTab === 'tornei' ? 'active' : ''}" aria-selected="${ui.adminTab === 'tornei'}" data-action="admin-tab" data-id="tornei">Tornei <span class="count">${tornei.length}</span></button>
          <button type="button" role="tab" class="tab ${ui.adminTab === 'utenti' ? 'active' : ''}" aria-selected="${ui.adminTab === 'utenti'}" data-action="admin-tab" data-id="utenti">Utenti <span class="count">${users.length}</span></button>
        </div>

        ${ui.adminTab === 'tornei'
          ? `${toolbar('adm', adminFilters, gamesList())}<p class="result-count" id="count" aria-live="polite"></p><div id="admin-table"></div>`
          : adminUsersTable(users, iscr)}
      </section>`;
    // Appena si apre la dashboard, rilegge dal DB tornei, iscritti e utenti
    const after = () => {
      updateAdminTable();
      refreshData().then((changed) => {
        if (changed && parseHash().segs[0] === 'admin' && !userIsBusy()) render(false);
      });
    };
    return { title: 'Dashboard admin', html, after };
  }

  function adminUsersTable(users, iscr) {
    if (!users.length) return emptyBox('Nessun utente registrato', 'Gli utenti compariranno qui dopo la registrazione.');
    return `<div class="table-wrap"><table class="table">
      <thead><tr><th>Utente</th><th>Email</th><th>Registrato il</th><th class="num">Iscrizioni</th></tr></thead>
      <tbody>${users.map((u) => `<tr>
        <td><span class="cell-user"><span class="avatar sm" aria-hidden="true">${esc(initials(u))}</span>${esc(u.nome)} ${esc(u.cognome)}</span></td>
        <td>${esc(u.email)}</td>
        <td>${esc(fmtStamp(u.createdAt))}</td>
        <td class="num">${iscr.filter((i) => same(i.userId, u.id)).length}</td>
      </tr>`).join('')}</tbody></table></div>`;
  }

  function updateAdminTable() {
    const host = $('#admin-table');
    if (!host) return;
    const list = filterTornei(getTornei(), adminFilters);
    $('#count').textContent = `${list.length} ${list.length === 1 ? 'torneo' : 'tornei'}`;
    if (!list.length) {
      host.innerHTML = emptyBox('Nessun torneo', 'Crea il primo torneo con il pulsante “Nuovo torneo”.');
      return;
    }
    host.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr><th>Torneo</th><th>Stato</th><th>Iscrizioni dal / al</th><th>Iscritti</th><th class="actions-col">Azioni</th></tr></thead>
      <tbody>${list.map((t) => {
        const n = countIscritti(t.id);
        const g = gameOf(t);
        return `<tr>
          <td><a class="cell-title" href="#/torneo/${t.id}"><span aria-hidden="true">${gameIco(g)}</span> ${esc(t.nome)}</a><small>${esc(t.gioco)}</small></td>
          <td><label class="status-wrap"><span class="sr-only">Stato di ${esc(t.nome)}</span>
            <select class="status-select st-${t.stato}" data-status-for="${t.id}">
              ${Object.entries(STATI).map(([k, v]) => `<option value="${k}" ${t.stato === k ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select></label></td>
          <td>${esc(fmtShort(t.inizioIscrizioni))} → ${esc(fmtShort(t.fineIscrizioni))}</td>
          <td><div class="cell-prog"><span>${n}/${t.maxPartecipanti}</span>${progress(n, t.maxPartecipanti)}</div></td>
          <td class="actions-col"><div class="row-actions">
            <button type="button" class="btn-icon" data-action="admin-participants" data-id="${t.id}" title="Iscritti" aria-label="Vedi iscritti di ${esc(t.nome)}">${icon('users')}</button>
            <button type="button" class="btn-icon" data-action="admin-edit" data-id="${t.id}" title="Modifica" aria-label="Modifica ${esc(t.nome)}">${icon('edit')}</button>
            <button type="button" class="btn-icon danger" data-action="admin-delete" data-id="${t.id}" title="Elimina" aria-label="Elimina ${esc(t.nome)}">${icon('trash')}</button>
          </div></td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
  }

  function openTorneoForm(t = null) {
    const g = t ? t.gioco : 'Valorant';
    openModal(`
      ${modalHead(t ? 'Modifica torneo' : 'Nuovo torneo')}
      <form data-form="torneo" novalidate>
        <div class="modal-body">
          <input type="hidden" name="id" value="${t ? t.id : ''}">
          ${field({ name: 'nome', label: 'Nome del torneo', value: t?.nome || '', attrs: 'maxlength="60" autofocus placeholder="Es. Valorant Campus Cup"' })}
          <div class="form-grid">
            ${selectField({ name: 'gioco', label: 'Gioco', value: g, options: Object.keys(GIOCHI).map((k) => [k, k]) })}
            ${selectField({ name: 'stato', label: 'Stato', value: t?.stato || 'aperto', options: Object.entries(STATI).map(([k, v]) => [k, v.label]) })}
          </div>
          <div class="form-grid">
            ${field({ name: 'inizioIscrizioni', label: 'Inizio iscrizioni', type: 'date', value: t?.inizioIscrizioni || todayISO() })}
            ${field({ name: 'fineIscrizioni', label: 'Fine iscrizioni', type: 'date', value: t?.fineIscrizioni || addDays(14) })}
          </div>
          ${field({ name: 'maxPartecipanti', label: 'Numero massimo di partecipanti', type: 'number', value: t?.maxPartecipanti ?? 16, attrs: 'min="2" max="512" step="1" inputmode="numeric"' })}
          ${textareaField({ name: 'descrizione', label: 'Descrizione', value: t?.descrizione || '', attrs: 'maxlength="600"', hint: 'Formato, regole e premi (10–600 caratteri).' })}
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-ghost" data-action="close-modal">Annulla</button>
          <button type="submit" class="btn btn-primary">${t ? 'Salva modifiche' : 'Crea torneo'}</button>
        </div>
      </form>`, 'lg');
  }

  function openParticipants(tid) {
    const t = getTorneo(tid);
    if (!t) return;
    const rows = getIscrizioni()
      .filter((i) => same(i.torneoId, tid))
      .map((i) => ({ i, u: getUser(i.userId) }))
      .filter((x) => x.u)
      .sort((a, b) => a.i.data.localeCompare(b.i.data));
    openModal(`
      ${modalHead(`Iscritti · ${esc(t.nome)}`)}
      <div class="modal-body">
        <div class="part-summary">${badge(t.stato)}<strong>${rows.length}/${t.maxPartecipanti}</strong> iscritti ${progress(rows.length, t.maxPartecipanti)}</div>
        ${rows.length
          ? `<div class="table-wrap"><table class="table compact">
              <thead><tr><th>#</th><th>Giocatore</th><th>Email</th><th>Iscritto il</th><th class="actions-col"><span class="sr-only">Azioni</span></th></tr></thead>
              <tbody>${rows.map(({ i, u }, idx) => `<tr>
                <td>${idx + 1}</td>
                <td><span class="cell-user"><span class="avatar sm" aria-hidden="true">${esc(initials(u))}</span>${esc(u.nome)} ${esc(u.cognome)}</span></td>
                <td>${esc(u.email)}</td>
                <td>${esc(fmtStamp(i.data))}</td>
                <td class="actions-col"><button type="button" class="btn-icon danger" data-action="remove-participant" data-id="${i.id}" data-extra="${t.id}" title="Rimuovi dal torneo" aria-label="Rimuovi ${esc(u.nome)} ${esc(u.cognome)}">${icon('x')}</button></td>
              </tr>`).join('')}</tbody></table></div>`
          : emptyBox('Nessun iscritto', 'Nessuno si è ancora iscritto a questo torneo.')}
      </div>
      <div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">Chiudi</button></div>`, 'lg');
  }

 

  const requireAdmin = () => {
    const me = currentUser();
    if (!me || me.role !== 'admin') { toast('Operazione riservata agli amministratori.', 'err'); return null; }
    return me;
  };

  const go = (path) => {
    if (location.hash === `#${path}`) render(true);
    else location.hash = `#${path}`;
  };

  /* ---- Azioni (data-action) ---- */
  const actions = {
    'nav-toggle': () => {
      const open = $('#header').classList.toggle('nav-open');
      $('.nav-toggle').setAttribute('aria-expanded', String(open));
    },

    'toggle-pw': (el) => {
      const input = $('input', el.closest('.input-wrap'));
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      el.innerHTML = icon(show ? 'eyeoff' : 'eye');
      el.setAttribute('aria-label', show ? 'Nascondi password' : 'Mostra password');
    },

    'fill-demo': (el) => {
      const d = DEMO[el.dataset.id];
      const form = $('form[data-form="login"]');
      if (!d || !form) return;
      form.elements.email.value = d.email;
      form.elements.password.value = d.password;
      form.elements.password.focus();
    },

    'close-modal': () => closeModal(),

    'reset-filters': () => {
      Object.assign(filters, { q: '', stato: '', gioco: '', sort: 'rilevanza' });
      render(false);
    },

    logout: () => {
      endSession();
      toast('Hai effettuato il logout.');
      go('/');
    },

    join: async (el) => {
      const me = currentUser();
      const t = getTorneo(el.dataset.id);
      console.log('[ITS] join - torneo:', t ? t.id + ' ' + t.nome : 'null', 'user:', me ? me.id : 'null');
      if (!t) return toast('Torneo non trovato.', 'err');
      if (!me) return go('/login?next=/torneo/' + t.id);
      if (me.role === 'admin') return toast('Gli amministratori non possono iscriversi ai tornei.', 'err');
      if (isJoined(me.id, t.id)) return toast('Sei già iscritto a questo torneo.', 'err');
      const r = regInfo(t);
      if (!r.canJoin) { toast('Iscrizione non possibile: ' + r.reason.toLowerCase() + '.', 'err'); return render(false); }
      // Verifica che il token JWT esista
      const token = getToken();
      if (!token) { toast('Sessione scaduta. Effettua di nuovo il login.', 'err'); return go('/login?next=/torneo/' + t.id); }
      try {
        const res = await fetch(API_BASE + '/tornei/' + t.id + '/iscrizioni', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        });
        console.log('[ITS] join response status:', res.status);
        const body = await res.text();
        console.log('[ITS] join response body:', body);
        if (!res.ok) {
          let msg = 'Errore iscrizione';
          try { const j = JSON.parse(body); msg = j.message || j.errore || msg; } catch(_) {}
          if (res.status === 401 || res.status === 403) msg = 'Sessione scaduta. Effettua di nuovo il login.';
          await refreshData(); render(false);
          throw new Error(msg);
        }
        // Riallinea con il database (iscrizioni e posti reali)
        await refreshData();
        toast('Iscrizione a "' + t.nome + '" confermata!');
        render(false);
      } catch (err) {
        console.error('[ITS] join error:', err);
        toast(err.message || 'Errore durante l\'iscrizione.', 'err');
      }
    },

    waitlist: (el) => {
      const me = currentUser(); const t = getTorneo(el.dataset.id);
      if (!me) return go(`/login?next=/torneo/${el.dataset.id}`);
      if (!t || me.role === 'admin') return toast('Non puoi entrare in questa lista d’attesa.', 'err');
      if (isJoined(me.id, t.id)) return toast('Sei già iscritto al torneo.', 'err');
      const r = regInfo(t);
      if (!r.full || t.stato !== 'aperto' || todayISO() < t.inizioIscrizioni || todayISO() > t.fineIscrizioni) return toast('La lista d’attesa non è disponibile.', 'err');
      const queue = getAttesa();
      if (queue.some(q => same(q.userId, me.id) && same(q.torneoId, t.id))) return toast('Sei già in lista d’attesa.', 'err');
      queue.push({ id: uid(), torneoId: t.id, userId: me.id, data: new Date().toISOString() }); setAttesa(queue);
      toast('Sei stato aggiunto alla lista d’attesa.'); render(false);
    },

    'leave-waitlist': (el) => {
      const me = currentUser(); if (!me) return;
      setAttesa(getAttesa().filter(q => !(same(q.userId, me.id) && same(q.torneoId, el.dataset.id))));
      toast('Hai lasciato la lista d’attesa.'); render(false);
    },

    'save-result': (el) => {
      if (!requireAdmin()) return;
      const form = el.closest('form'); if (!form) return;
      const fd = new FormData(form); const torneoId = String(fd.get('torneoId') || '');
      const t = getTorneo(torneoId); const vincitore = clean(fd.get('vincitore')); const secondo = clean(fd.get('secondo'));
      const punteggio = clean(fd.get('punteggio'));
      if (!t || !vincitore || !secondo || !punteggio) return toast('Compila tutti i campi del risultato.', 'err');
      const results = getRisultati().filter(r => r.torneoId !== torneoId);
      results.push({ id: uid(), torneoId, vincitore, secondo, punteggio, data: new Date().toISOString() }); setRisultati(results);
      toast('Risultato salvato.'); render(false);
    },

    leave: async (el) => {
      const me = currentUser();
      const t = getTorneo(el.dataset.id);
      if (!me || !t) return;
      if (!canLeave(t)) return toast('Non puoi più disiscriverti da questo torneo.', 'err');
      const ok = await confirmDialog({
        title: 'Disiscrizione',
        message: `Vuoi davvero annullare l’iscrizione a <strong>${esc(t.nome)}</strong>?`,
        confirmLabel: 'Sì, disiscrivimi',
        danger: true
      });
      if (!ok) return;
      if (serverReady) {
        try {
          await apiRequest(`/tornei/${t.id}/iscrizioni`, { method: 'DELETE' });
        } catch(err) { toast(err.message || 'Errore disiscrizione.', 'err'); await refreshData(); render(false); return; }
        await refreshData();
      } else {
        setIscrizioni(getIscrizioni().filter((i) => !(same(i.userId, me.id) && same(i.torneoId, t.id))));
      }
      const queue = getAttesa().filter(q => same(q.torneoId, t.id)).sort((a,b) => a.data.localeCompare(b.data));
      const next = queue[0];
      // Con il server attivo il posto liberato resta disponibile a chi è in lista d'attesa (si iscrive dal proprio account);
      // la promozione automatica locale avviene solo in modalità offline.
      if (!serverReady && next && countIscritti(t.id) < t.maxPartecipanti) {
        const promoted = getUser(next.userId);
        if (promoted) {
          setIscrizioni([...getIscrizioni(), { id: uid(), torneoId: t.id, userId: next.userId, data: new Date().toISOString() }]);
          toast(`${promoted.nome} è stato promosso dalla lista d’attesa.`);
        }
        setAttesa(getAttesa().filter(q => q.id !== next.id));
      }
      toast('Ti sei disiscritto dal torneo.');
      render(false);
    },

    tab: (el) => { ui.profileTab = el.dataset.id; render(false); },
    'admin-tab': (el) => { if (requireAdmin()) { ui.adminTab = el.dataset.id; render(false); } },

    'edit-profile': () => { if (currentUser()) openProfileForm(); },

    'admin-new': () => { if (requireAdmin()) openTorneoForm(); },
    'admin-edit': (el) => {
      if (!requireAdmin()) return;
      const t = getTorneo(el.dataset.id);
      if (t) openTorneoForm(t);
    },
    'admin-participants': (el) => { if (requireAdmin()) openParticipants(el.dataset.id); },

    'admin-delete': async (el) => {
      if (!requireAdmin()) return;
      const t = getTorneo(el.dataset.id);
      if (!t) return;
      const n = countIscritti(t.id);
      const ok = await confirmDialog({
        title: 'Elimina torneo',
        message: `Stai per eliminare definitivamente <strong>${esc(t.nome)}</strong>${n ? ` e le sue <strong>${n}</strong> iscrizioni` : ''}. L’operazione non può essere annullata.`,
        confirmLabel: 'Elimina torneo',
        danger: true
      });
      if (!ok) return;
      if (serverReady) {
        try { await apiRequest(`/admin/tornei/${t.id}`, { method: 'DELETE' }); }
        catch (err) { return adminFail(err); }
        await refreshData();
      } else {
        setTornei(getTornei().filter((x) => !same(x.id, t.id)));
        setIscrizioni(getIscrizioni().filter((i) => !same(i.torneoId, t.id)));
      }
      toast(`Torneo “${t.nome}” eliminato.`);
      render(false);
    },

    'remove-participant': async (el) => {
      if (!requireAdmin()) return;
      const reg = getIscrizioni().find((i) => same(i.id, el.dataset.id));
      if (!reg) return;
      const u = getUser(reg.userId);
      const tid = el.dataset.extra;
      const ok = await confirmDialog({
        title: 'Rimuovi iscritto',
        message: `Rimuovere <strong>${esc(u ? `${u.nome} ${u.cognome}` : 'questo utente')}</strong> dal torneo?`,
        confirmLabel: 'Rimuovi',
        danger: true
      });
      if (!ok) { openParticipants(tid); return; }
      if (serverReady) {
        try { await apiRequest(`/admin/tornei/${reg.torneoId}/iscritti/${reg.userId}`, { method: 'DELETE' }); }
        catch (err) { adminFail(err); openParticipants(tid); return; }
        await refreshData();
      } else {
        setIscrizioni(getIscrizioni().filter((i) => i.id !== reg.id));
      }
      toast('Iscritto rimosso dal torneo.');
      render(false);
      openParticipants(tid);
    },

    'reset-demo': async () => {
      if (!requireAdmin()) return;
      const ok = await confirmDialog({
        title: 'Ripristina dati demo',
        message: 'Tutti i dati attuali (utenti, tornei, iscrizioni) verranno sostituiti con quelli di esempio e verrai disconnesso.',
        confirmLabel: 'Ripristina',
        danger: true
      });
      if (!ok) return;
      [KEY.users, KEY.tornei, KEY.iscrizioni, KEY.session, KEY.seed, KEY.attesa, KEY.risultati].forEach((k) => store.removeItem(k));
      await seed(true);
      await refreshData();
      toast('Dati demo ripristinati.');
      go('/');
    }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault();
    fn(el, e);
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#nav a, #nav button[data-action="logout"]')) {
      $('#header').classList.remove('nav-open');
      $('.nav-toggle').setAttribute('aria-expanded', 'false');
    }
  });

  const scopes = { pub: [filters, () => updateGrid()], adm: [adminFilters, () => updateAdminTable()] };
  function onFilter(e) {
    const el = e.target.closest('[data-filter]');
    if (!el) return;
    const [scope, key] = el.dataset.filter.split('.');
    const [obj, refresh] = scopes[scope] || [];
    if (!obj) return;
    obj[key] = el.value;
    refresh();
  }
  document.addEventListener('input', onFilter);
  document.addEventListener('change', onFilter);

  // Errori delle chiamate admin: se la sessione è scaduta si torna al login
  function adminFail(err) {
    toast(err.message || 'Operazione non riuscita.', 'err');
    if (err.authError) { endSession(); go('/login?next=/admin'); return; }
    refreshData().then(() => render(false));
  }

  document.addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-status-for]');
    if (!sel) return;
    if (!requireAdmin()) return render(false);
    const t = getTorneo(sel.dataset.statusFor);
    const nuovo = sel.value;
    if (!t || !STATI[nuovo]) return render(false);
    if (nuovo === t.stato) return;
    // Feedback immediato: cambia subito il colore del menu
    sel.className = `status-select st-${nuovo}`;
    sel.disabled = true;
    if (serverReady) {
      try {
        await apiRequest(`/admin/tornei/${t.id}/stato`, { method: 'PUT', body: JSON.stringify({ stato: nuovo }) });
      } catch (err) { return adminFail(err); }
      await refreshData(); // rilegge dal DB: homepage e dashboard mostrano il valore realmente salvato
    } else {
      const list = getTornei();
      const lt = list.find((x) => same(x.id, t.id));
      if (lt) { lt.stato = nuovo; setTornei(list); }
    }
    toast(`Stato di “${t.nome}” aggiornato: ${STATI[nuovo].label}.`);
    render(false);
  });

  document.addEventListener('input', (e) => {
    if (e.target.id !== 'f_password') return;
    const meter = $('#strength');
    if (!meter) return;
    const s = strength(e.target.value);
    meter.dataset.level = s.level;
    $('em', meter).textContent = s.label;
  });

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
            users.push({ id: r.id, nome: r.nome, cognome: r.cognome, email: r.email, role: 'user', salt: '', hash: '', createdAt: r.iscrittoAl || new Date().toISOString() });
            usersChanged = true;
          }
        }
      }
      let changed = saveIfChanged(KEY.iscrizioni, iscr);
      if (usersChanged) { try { store.setItem(KEY.users, JSON.stringify(users)); } catch (_) {} changed = true; }
      return changed;
    } catch (err) { console.warn('loadIscrizioniFromServer fallito:', err); return false; }
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
      return a || b || c;
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

  /* ---- Form (data-form) ---- */
  const formHandlers = {
    'result-entry': async (form, fd) => {
      if (!requireAdmin()) return;
      const torneoId = clean(fd.get('torneoId')); const vincitore = clean(fd.get('vincitore')); const secondo = clean(fd.get('secondo')); const punteggio = clean(fd.get('punteggio'));
      if (!getTorneo(torneoId) || !vincitore || !secondo || !punteggio || vincitore.toLowerCase() === secondo.toLowerCase()) return toast('Controlla i dati del risultato: vincitore e secondo devono essere diversi.', 'err');
      const results = getRisultati().filter(r => r.torneoId !== torneoId); results.push({id:uid(), torneoId, vincitore, secondo, punteggio, data:new Date().toISOString()}); setRisultati(results); toast('Risultato salvato.'); render(false);
    },
    login: async (form, fd) => {
      const email = clean(fd.get('email')).toLowerCase();
      const pw = String(fd.get('password') || '');
      const errs = {};
      if (!EMAIL_RE.test(email)) errs.email = 'Inserisci un indirizzo email valido.';
      if (!pw) errs.password = 'Inserisci la password.';
      if (!setErrors(form, errs)) return;

      let u;
      try {
        const auth = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: pw }) });
        if (auth.accessToken) store.setItem('itsx.accessToken', auth.accessToken);
        // Carica le iscrizioni reali dal backend
        try {
          const myTornei = await fetch(`${API_BASE}/me/tornei`, { headers: { 'Authorization': 'Bearer ' + auth.accessToken } });
          if (myTornei.ok) {
            const myList = await myTornei.json();
            const iscr = (myList || []).map(t => ({ id: uid(), torneoId: t.id, userId: auth.user?.id || '', data: new Date().toISOString() }));
            store.setItem('itsx.iscrizioni', JSON.stringify(iscr));
          }
        } catch(_) {}
        const remote = auth.user || {};
        const users = getUsers();
        const existing = users.find((x) => x.email === email);
        const salt = existing?.salt || uid();
        u = {
          id: remote.id || existing?.id || uid(),
          nome: remote.nome || existing?.nome || email.split('@')[0],
          cognome: remote.cognome || existing?.cognome || '',
          email,
          role: remote.role || existing?.role || 'user',
          salt,
          hash: await hashPassword(pw, salt),
          createdAt: remote.createdAt || existing?.createdAt || new Date().toISOString()
        };
        setUsers([...users.filter((x) => x.email !== email && !same(x.id, u.id)), u]);
        await refreshData();
      } catch (err) {
        setErrors(form, { password: err.message || 'Email o password non corretti.' });
        return;
      }

      startSession(u);
      pushState();
      toast(`Bentornato, ${u.nome}!`);
      go(safeNext(parseHash().query.get('next')) || (u.role === 'admin' ? '/admin' : '/'));
    },

    register: async (form, fd) => {
      const nome = clean(fd.get('nome'));
      const cognome = clean(fd.get('cognome'));
      const email = clean(fd.get('email')).toLowerCase();
      const pw = String(fd.get('password') || '');
      const pw2 = String(fd.get('password2') || '');
      const errs = {};

      const en = validateName(nome, 'Nome'); if (en) errs.nome = en;
      const ec = validateName(cognome, 'Cognome'); if (ec) errs.cognome = ec;
      if (!EMAIL_RE.test(email)) errs.email = 'Inserisci un indirizzo email valido.';
      else if (getUsers().some((u) => u.email === email)) errs.email = 'Esiste già un account con questa email.';
      const ep = validatePassword(pw); if (ep) errs.password = ep;
      if (!errs.password && pw !== pw2) errs.password2 = 'Le password non coincidono.';
      else if (!pw2 && !errs.password2) errs.password2 = 'Conferma la password.';
      if (!setErrors(form, errs)) return;

      let user;
      try {
        const auth = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ nome, cognome, email, password: pw })
        });
        if (auth.accessToken) store.setItem('itsx.accessToken', auth.accessToken);
        // Carica le iscrizioni reali dal backend
        try {
          const myTornei = await fetch(`${API_BASE}/me/tornei`, { headers: { 'Authorization': 'Bearer ' + auth.accessToken } });
          if (myTornei.ok) {
            const myList = await myTornei.json();
            const iscr = (myList || []).map(t => ({ id: uid(), torneoId: t.id, userId: auth.user?.id || '', data: new Date().toISOString() }));
            store.setItem('itsx.iscrizioni', JSON.stringify(iscr));
          }
        } catch(_) {}
        const salt = uid();
        user = {
          id: auth.user?.id || uid(), nome, cognome, email,
          salt, hash: await hashPassword(pw, salt), role: auth.user?.role || 'user',
          createdAt: auth.user?.createdAt || new Date().toISOString()
        };
      } catch (err) {
        setErrors(form, { email: err.message || 'Registrazione non riuscita.' });
        return;
      }
      const users = getUsers();
      users.push(user);
      setUsers(users);
      await refreshData();
      startSession(user);
      pushState();
      toast(`Benvenuto, ${user.nome}! Account creato.`);
      go(safeNext(String(fd.get('next') || '')) || '/profilo');
    },

    profile: async (form, fd) => {
      const me = currentUser();
      if (!me) return;
      const nome = clean(fd.get('nome'));
      const cognome = clean(fd.get('cognome'));
      const cur = String(fd.get('current') || '');
      const pw = String(fd.get('password') || '');
      const pw2 = String(fd.get('password2') || '');
      const errs = {};

      const en = validateName(nome, 'Nome'); if (en) errs.nome = en;
      const ec = validateName(cognome, 'Cognome'); if (ec) errs.cognome = ec;

      const wantsPw = cur || pw || pw2;
      if (wantsPw) {
        if (!cur) errs.current = 'Inserisci la password attuale.';
        else if ((await hashPassword(cur, me.salt)) !== me.hash) errs.current = 'La password attuale non è corretta.';
        const ep = validatePassword(pw); if (ep) errs.password = ep;
        else if (pw !== pw2) errs.password2 = 'Le password non coincidono.';
      }
      if (!setErrors(form, errs)) return;

      const users = getUsers();
      const u = users.find((x) => x.id === me.id);
      u.nome = nome;
      u.cognome = cognome;
      if (wantsPw) {
        u.salt = uid();
        u.hash = await hashPassword(pw, u.salt);
      }
      setUsers(users);
      closeModal();
      toast(wantsPw ? 'Profilo e password aggiornati.' : 'Profilo aggiornato.');
      render(false);
    },

    torneo: async (form, fd) => {
      if (!requireAdmin()) return;
      const id = String(fd.get('id') || '');
      const data = {
        nome: clean(fd.get('nome')),
        gioco: String(fd.get('gioco') || ''),
        stato: String(fd.get('stato') || ''),
        inizioIscrizioni: String(fd.get('inizioIscrizioni') || ''),
        fineIscrizioni: String(fd.get('fineIscrizioni') || ''),
        maxPartecipanti: Number(fd.get('maxPartecipanti')),
        descrizione: String(fd.get('descrizione') || '').trim()
      };
      const errs = {};

      if (data.nome.length < 3 || data.nome.length > 60) errs.nome = 'Il nome deve avere tra 3 e 60 caratteri.';
      else if (getTornei().some((t) => !same(t.id, id) && t.nome.toLowerCase() === data.nome.toLowerCase())) errs.nome = 'Esiste già un torneo con questo nome.';
      if (!GIOCHI[data.gioco]) errs.gioco = 'Seleziona un gioco.';
      if (!STATI[data.stato]) errs.stato = 'Seleziona uno stato.';
      if (!isISO(data.inizioIscrizioni)) errs.inizioIscrizioni = 'Inserisci una data valida.';
      if (!isISO(data.fineIscrizioni)) errs.fineIscrizioni = 'Inserisci una data valida.';
      else if (isISO(data.inizioIscrizioni) && data.fineIscrizioni < data.inizioIscrizioni) errs.fineIscrizioni = 'La fine non può precedere l’inizio delle iscrizioni.';
      else if (!id && data.fineIscrizioni < todayISO()) errs.fineIscrizioni = 'La data di fine non può essere nel passato.';
      if (!Number.isInteger(data.maxPartecipanti) || data.maxPartecipanti < 2 || data.maxPartecipanti > 512) errs.maxPartecipanti = 'Inserisci un numero intero tra 2 e 512.';
      else if (id && data.maxPartecipanti < countIscritti(id)) errs.maxPartecipanti = `Ci sono già ${countIscritti(id)} iscritti: il massimo non può essere inferiore.`;
      if (data.descrizione.length < 10 || data.descrizione.length > 600) errs.descrizione = 'La descrizione deve avere tra 10 e 600 caratteri.';
      if (!setErrors(form, errs)) return;

      const btn = $('button[type="submit"]', form);
      if (btn) btn.disabled = true;
      try {
        if (serverReady) {
          const body = JSON.stringify({
            nome: data.nome, gioco: data.gioco, stato: data.stato,
            inizioIscrizioni: data.inizioIscrizioni, fineIscrizioni: data.fineIscrizioni,
            maxPartecipanti: data.maxPartecipanti, descrizione: data.descrizione
          });
          if (id) await apiRequest(`/admin/tornei/${id}`, { method: 'PUT', body });
          else await apiRequest('/admin/tornei', { method: 'POST', body });
          await refreshData();
        } else {
          const list = getTornei();
          if (id) {
            const t = list.find((x) => same(x.id, id));
            if (!t) { closeModal(); return toast('Torneo non trovato.', 'err'); }
            Object.assign(t, data);
          } else {
            list.push({ id: uid(), createdAt: new Date().toISOString(), ...data });
          }
          setTornei(list);
        }
      } catch (err) {
        if (btn) btn.disabled = false;
        if (err.authError) { closeModal(); return adminFail(err); }
        return setErrors(form, { nome: err.message || 'Salvataggio non riuscito.' });
      }
      toast(id ? `Torneo “${data.nome}” aggiornato.` : `Torneo “${data.nome}” creato.`);
      closeModal();
      render(false);
    }
  };

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    const handler = formHandlers[form.dataset.form];
    if (handler) handler(form, new FormData(form));
  });

  function renderNav() {
    const me = currentUser();
    const cur = parseHash().segs[0] || '';
    const link = (href, label, keys) => {
      const active = keys.includes(cur);
      return `<a href="#${href}" class="nav-link${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
    };
    let html = link('/', 'Home', ['']) + link('/tornei', 'Tornei', ['tornei', 'torneo']) + link('/calendario', 'Calendario', ['calendario']) + link('/risultati', 'Risultati e classifica', ['risultati']) + (me && me.role !== 'admin' ? link('/attesa', 'Lista d’attesa', ['attesa']) : '');
    if (me && me.role === 'admin') html += link('/admin', `${icon('shield')} Dashboard`, ['admin']);
    if (me && me.role !== 'admin') html += link('/profilo', 'Il mio profilo', ['profilo']);

    html += '<span class="nav-spacer"></span>';
    if (me) {
      html += `<span class="user-chip"><span class="avatar sm" aria-hidden="true">${esc(initials(me))}</span><span>${esc(me.nome)}</span></span>
               <button type="button" class="btn btn-ghost btn-sm" data-action="logout">${icon('logout')} Esci</button>`;
    } else {
      html += `<a class="btn btn-ghost btn-sm" href="#/login">Accedi</a>
               <a class="btn btn-primary btn-sm" href="#/registrati">Registrati</a>`;
    }
    $('#nav').innerHTML = html;
  }
  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, qs = ''] = raw.split('?');
    return { segs: path.split('/').filter(Boolean), query: new URLSearchParams(qs) };
  }

  function render(navigated = true) {
    const { segs, query } = parseHash();
    const me = currentUser();
    const [a, b] = segs;
    let view;

    if (navigated) closeModal();

    if (!a) view = viewHome();
    else if (a === 'tornei' && !b) view = viewTornei();
    else if (a === 'torneo' && b) view = viewTorneo(b);
    else if (a === 'calendario') view = viewCalendario();
    else if (a === 'risultati') view = viewRisultati();
    else if (a === 'attesa') { if (!me) return go('/login?next=/attesa'); if (me.role === 'admin') return go('/admin'); view = viewAttesa(); }
    else if (a === 'login') {
      if (me) return go(me.role === 'admin' ? '/admin' : '/profilo');
      view = viewLogin(query);
    } else if (a === 'registrati') {
      if (me) return go(me.role === 'admin' ? '/admin' : '/profilo');
      view = viewRegister(query);
    } else if (a === 'profilo') {
      if (!me) return go('/login?next=/profilo');
      if (me.role === 'admin') return go('/admin');
      view = viewProfilo();
    } else if (a === 'admin') {
      if (!me) return go('/login?next=/admin');
      if (me.role !== 'admin') {
        toast('Area riservata agli amministratori.', 'err');
        return go('/');
      }
      view = viewAdmin();
    } else view = viewNotFound();

    renderNav();
    document.title = `${view.title} · ITS Lazio Digital E-Sports`;
    const main = $('#main');
    main.innerHTML = view.html;
    if (view.after) view.after();
    if (navigated) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  }

  window.addEventListener('hashchange', () => render(true));
  // Sincronizza più schede aperte
  window.addEventListener('storage', (e) => { if (e.key && e.key.startsWith('itsx.')) render(false); });

  /* ---- Avvio ---- */
  (async function init() {
    $('#year').textContent = new Date().getFullYear();
    await syncStateFromServer();
    await seed();
    await refreshData();  // sempre dopo seed: tornei, iscrizioni (e utenti per l'admin) arrivano dal DB reale
    await pushState();
    render(true);
  })();
})();