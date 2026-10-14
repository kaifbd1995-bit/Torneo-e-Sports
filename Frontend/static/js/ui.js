/* Componenti UI: toast, modali, campi form, card torneo
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

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
