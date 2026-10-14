/* Gestori dei form (login, registrazione, profilo, torneo, risultati)
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

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
        const myTornei = await fetch(`${API_BASE}/utente/tornei`, { headers: { 'Authorization': 'Bearer ' + auth.accessToken } });
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
        const myTornei = await fetch(`${API_BASE}/utente/tornei`, { headers: { 'Authorization': 'Bearer ' + auth.accessToken } });
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

  settings: async (form, fd) => {
    if (!requireAdmin()) return;
    const v = Number(String(fd.get('maxTorneiPerUtente') || '').trim());
    const errs = {};
    if (!Number.isInteger(v) || v < 1 || v > 100) errs.maxTorneiPerUtente = 'Inserisci un numero intero tra 1 e 100.';
    if (!setErrors(form, errs)) return;
    const btn = $('button[type="submit"]', form);
    if (btn) btn.disabled = true;
    try {
      if (serverReady) {
        const res = await apiRequest('/admin/impostazioni', { method: 'PUT', body: JSON.stringify({ maxTorneiPerUtente: v }) });
        saveIfChanged(KEY.config, { maxTorneiPerUtente: Number(res.maxTorneiPerUtente) || v });
      } else {
        saveIfChanged(KEY.config, { maxTorneiPerUtente: v });
      }
    } catch (err) {
      if (btn) btn.disabled = false;
      if (err.authError) return adminFail(err);
      return setErrors(form, { maxTorneiPerUtente: err.message || 'Salvataggio non riuscito.' });
    }
    toast(`Limite aggiornato: ${v} ${v === 1 ? 'torneo' : 'tornei'} contemporanei per utente.`);
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
