/* Dashboard admin: tabella tornei, utenti, form torneo, iscritti
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

function viewAdmin() {
  const tornei = getTornei();
  const users = (serverReady && serverUsers ? serverUsers : getUsers()).filter((u) => u.role !== 'admin');
  const iscr = getIscrizioni().filter((i) => getTorneo(i.torneoId));

  const html = `
    <section class="container page-head">
      <div class="admin-head">
        <div>
                    <h1>Dashboard admin</h1>
          <p class="lead">Crea i tornei, cambia il loro stato e controlla chi si è iscritto.</p>
        </div>
        <div class="admin-actions">
          <button type="button" class="btn btn-ghost" data-action="reset-demo">${icon('refresh')} Ripristina dati demo</button>
          <button type="button" class="btn btn-primary btn-lg" data-action="admin-new">${icon('plus')} Nuovo torneo</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><span class="stat-num">${tornei.length}</span><span class="stat-label">tornei</span></div>
        <div class="stat"><span class="stat-num">${tornei.filter((t) => t.stato === 'aperto').length}</span><span class="stat-label">aperti</span></div>
        <div class="stat"><span class="stat-num">${tornei.filter((t) => t.stato === 'in_corso').length}</span><span class="stat-label">in corso</span></div>
        <div class="stat"><span class="stat-num">${iscr.length}</span><span class="stat-label">iscrizioni</span></div>
      </div>

      <form class="card pad settings-card" data-form="settings" novalidate>
        <div class="settings-text">
          <h2>Limite iscrizioni per utente</h2>
          <p class="muted">Numero massimo di tornei (aperti o in corso) a cui un utente può essere iscritto contemporaneamente. Vale per tutti gli utenti. Chi ha raggiunto il limite non può iscriversi né entrare in lista d’attesa per un altro torneo.</p>
        </div>
        <div class="settings-controls">
          ${field({ name: 'maxTorneiPerUtente', label: 'Max tornei per utente', type: 'number', value: getMaxTornei(), attrs: 'min="1" max="100" step="1" inputmode="numeric"' })}
          <button type="submit" class="btn btn-primary">Salva limite</button>
        </div>
      </form>

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
      <td><span class="cell-user"><span class="avatar sm" aria-hidden="true">${esc(initials(u))}</span>${esc(u.nome)} ${esc(u.cognome)}${u.nickname ? ` <span class="muted">(${esc(u.nickname)})</span>` : ''}</span></td>
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
              <td><span class="cell-user"><span class="avatar sm" aria-hidden="true">${esc(initials(u))}</span>${esc(u.nome)} ${esc(u.cognome)}${u.nickname ? ` <span class="muted">(${esc(u.nickname)})</span>` : ''}</span></td>
              <td>${esc(u.email)}</td>
              <td>${esc(fmtStamp(i.data))}</td>
              <td class="actions-col"><button type="button" class="btn-icon danger" data-action="remove-participant" data-id="${i.id}" data-extra="${t.id}" title="Rimuovi dal torneo" aria-label="Rimuovi ${esc(u.nome)} ${esc(u.cognome)}">${icon('x')}</button></td>
            </tr>`).join('')}</tbody></table></div>`
        : emptyBox('Nessun iscritto', 'Nessuno si è ancora iscritto a questo torneo.')}
    </div>
    <div class="modal-foot"><button type="button" class="btn btn-ghost" data-action="close-modal">Chiudi</button></div>`, 'lg');
}

 
