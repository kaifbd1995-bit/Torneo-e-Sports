/* Navigazione, menu e rendering delle pagine
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

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
