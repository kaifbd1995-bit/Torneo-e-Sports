/* Hash password dimostrativo e dati demo locali
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

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

 
