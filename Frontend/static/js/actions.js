/* Azioni (data-action), filtri, cambio stato torneo
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

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
      const res = await fetch(API_BASE + '/tornei/' + t.id + '/iscrizione', {
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
        await apiRequest(`/tornei/${t.id}/iscrizione`, { method: 'DELETE' });
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
