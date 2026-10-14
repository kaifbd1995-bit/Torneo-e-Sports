/* Area personale: profilo utente
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

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
        <p class="muted">${esc(t.gioco)}, iscritto il ${esc(fmtStamp(i.data))}</p>
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
          <p class="muted">${esc(me.email)}, registrato il ${esc(fmtStamp(me.createdAt))}</p>
        </div>
        <button type="button" class="btn btn-ghost" data-action="edit-profile">${icon('settings')} Modifica profilo</button>
      </div>

      <div class="stats stats-3">
        <div class="stat"><span class="stat-num">${attive.length}</span><span class="stat-label">iscrizioni attive</span></div>
        <div class="stat"><span class="stat-num">${conclusi}</span><span class="stat-label">tornei conclusi</span></div>
        <div class="stat"><span class="stat-num">${mine.length}</span><span class="stat-label">iscrizioni totali</span></div>
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
