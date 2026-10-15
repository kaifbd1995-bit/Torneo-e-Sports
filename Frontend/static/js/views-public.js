/* Pagine pubbliche: home, tornei, dettaglio, calendario, risultati, login, registrazione
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

function viewHome() {
  const all = getTornei();
  const me = currentUser();
  const inCorso = all.filter((t) => t.stato === 'in_corso');
  const aperti = all
    .filter((t) => t.stato === 'aperto')
    .sort((a, b) => a.fineIscrizioni.localeCompare(b.fineIscrizioni));
  const players = getUsers().filter((u) => u.role !== 'admin' && (!serverReady || typeof u.id === 'number')).length;
  const iscritti = getIscrizioni().filter((i) => getTorneo(i.torneoId)).length;
  const next = serverReady && serverStats
    ? (serverNext ? getTorneo(serverNext.id) : null)
    : aperti.find((t) => regInfo(t).canJoin);
  const S = (serverReady && serverStats) ? serverStats : null;

  const heroPanel = next
    ? (() => {
        const r = regInfo(next);
        const g = gameOf(next);
        return `<a class="hero-panel" href="#/torneo/${next.id}" style="--h:${g.hue}" aria-label="Apri ${esc(next.nome)}">
          <div class="fixture-art">${g.img ? `<img src="${g.img}" alt="" onerror="this.remove()">` : ''}</div>
          <div class="fixture-body">
            <p class="panel-label">Prossima scadenza</p>
            <h3>${esc(next.nome)}</h3>
            <p class="fixture-game">${esc(next.gioco)}</p>
            ${progress(r.n, next.maxPartecipanti)}
            <div class="panel-row"><span>${r.left} ${r.left === 1 ? 'posto libero' : 'posti liberi'}</span><strong>${esc(deadlineText(next))}</strong></div>
            <span class="btn btn-primary btn-block">Vedi il torneo</span>
          </div>
        </a>`;
      })()
    : `<div class="hero-panel hero-panel-empty">${emptyBox('Nessuna iscrizione aperta', 'Appena parte un nuovo torneo lo trovi qui.')}</div>`;

  const secondary = !me
    ? `<a class="btn btn-ghost btn-lg" href="#/registrati">Crea il profilo</a>`
    : me.role === 'admin'
      ? `<a class="btn btn-ghost btn-lg" href="#/admin">Apri la dashboard</a>`
      : `<a class="btn btn-ghost btn-lg" href="#/profilo">Il mio profilo</a>`;

  const section = (id, titleHtml, sub, list, emptyHtml) => `
    <section class="section container" aria-labelledby="${id}">
      <div class="section-head">
        <div><h2 id="${id}">${titleHtml}</h2><p>${sub}</p></div>
        <a class="link-arrow" href="#/tornei">Tutti i tornei</a>
      </div>
      ${list.length ? `<div class="grid">${list.map(cardHTML).join('')}</div>` : emptyHtml}
    </section>`;

  const html = `
    <section class="hero">
      <svg class="hero-shapes" viewBox="0 0 640 560" aria-hidden="true" focusable="false">
        <path class="s-yellow" d="M70 250 A130 130 0 0 1 300 150"/>
        <path class="s-red" d="M330 110 A130 130 0 0 1 560 250"/>
        <path class="s-green" d="M540 330 A130 130 0 0 1 380 470"/>
        <path class="s-blue" d="M300 470 A130 130 0 0 1 100 340"/>
      </svg>
      <div class="container hero-inner">
        <div class="hero-copy">
          <h1>Tornei e-sports per gli studenti dell’ITS Lazio Digital</h1>
          <p class="lead">Guarda quali tornei hanno le iscrizioni aperte, scegli il gioco e prenota il tuo posto. Se cambi idea, ti disiscrivi finché il torneo è aperto.</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="#/tornei">Vedi i tornei</a>
            ${secondary}
          </div>
        </div>
        ${heroPanel}
      </div>
    </section>

    <section class="container" aria-label="Numeri del portale">
      <div class="stats">
        <div class="stat"><span class="stat-num">${S ? S.iscrizioniAperte : aperti.length}</span><span class="stat-label">iscrizioni aperte</span></div>
        <div class="stat"><span class="stat-num">${S ? S.torneiInCorso : inCorso.length}</span><span class="stat-label">tornei in corso</span></div>
        <div class="stat"><span class="stat-num">${S ? S.giocatoriRegistrati : players}</span><span class="stat-label">giocatori registrati</span></div>
        <div class="stat"><span class="stat-num">${S ? S.iscrizioniTotali : iscritti}</span><span class="stat-label">iscrizioni totali</span></div>
      </div>
    </section>

    ${section('h-corso', '<span class="live-dot" aria-hidden="true"></span> Tornei in corso', 'Si stanno giocando adesso.', inCorso,
      emptyBox('Nessun torneo in corso', 'Al momento nessuna partita è in programma.'))}

    ${section('h-aperti', 'Iscrizioni aperte', 'Scegli il torneo e blocca il tuo posto prima che finiscano.', aperti,
      emptyBox('Nessun torneo con iscrizioni aperte', 'Quando ne parte uno nuovo, lo trovi qui.'))}

    <section class="section container" aria-labelledby="h-how">
      <div class="section-head"><div><h2 id="h-how">Come iscriversi</h2><p>Bastano tre passaggi.</p></div></div>
      <ol class="steps">
        <li class="step"><span class="step-n">1</span><h3>Crea l’account</h3><p>Nome, cognome, email e password. Ci metti meno di un minuto.</p></li>
        <li class="step"><span class="step-n">2</span><h3>Scegli il torneo</h3><p>Leggi la descrizione e controlla quanti posti sono ancora liberi.</p></li>
        <li class="step"><span class="step-n">3</span><h3>Conferma</h3><p>Un clic e sei dentro. Il tuo profilo mostra tutte le iscrizioni.</p></li>
      </ol>
    </section>

    ${me ? '' : `
    <section class="container section">
      <div class="cta-band">
        <div><h2>Hai già scelto il gioco?</h2><p>Crea un account gratuito e iscriviti al primo torneo.</p></div>
        <a class="btn btn-primary btn-lg" href="#/registrati">Crea l’account</a>
      </div>
    </section>`}`;

  return { title: 'Home', html };
}

function toolbar(scope, f, games) {
  return `<div class="toolbar" role="search">
    <label class="search"><span class="sr-only">Cerca</span>${icon('search')}
      <input type="search" placeholder="Cerca un torneo o un gioco" value="${esc(f.q)}" data-filter="${scope}.q"></label>
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
      <h1>Tutti i tornei</h1>
      <p class="lead">Aperti, in corso o conclusi. Per guardare non serve un account.</p>
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
  else if (!isJoined(me.id, t.id) && t.stato === 'aperto' && limitInfo(me.id).reached) note = `<p class="side-note">${esc(limitMsg(getMaxTornei()))}</p>`;

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
  return { title: 'Calendario partite', html: `<section class="container page-head"><div class="section-head"><div><h1>Calendario partite</h1><p class="muted">Consulta le date dei tornei e apri le schede per tutti i dettagli.</p></div></div>
    <div class="calendar-list">${Object.keys(grouped).length ? Object.entries(grouped).map(([date,items]) => `<section class="card calendar-day"><div class="calendar-date"><strong>${esc(fmtShort(date))}</strong><span>${esc(fmtDate(date))}</span></div><div class="calendar-events">${items.map(t => `<article class="calendar-event"><span class="calendar-emoji">${gameIco(gameOf(t))}</span><div class="calendar-event-main"><h3><a href="#/torneo/${t.id}">${esc(t.nome)}</a></h3><p>${badge(t.stato)} <span class="muted">${esc(t.gioco)}</span></p><small>${t.dataPartita ? 'Data partita' : 'Data indicativa: chiusura iscrizioni'}</small></div><a class="btn btn-ghost btn-sm" href="#/torneo/${t.id}">Dettagli</a></article>`).join('')}</div></section>`).join('') : emptyBox('Nessuna partita in calendario','I tornei appariranno qui quando saranno disponibili.')}</div></section>` };
}

function viewRisultati() {
  const results = getRisultati().map(r => ({...r, torneo:getTorneo(r.torneoId)})).filter(r => r.torneo).sort((a,b) => b.data.localeCompare(a.data));
  const standings = {};
  results.forEach(r => { standings[r.vincitore] = (standings[r.vincitore] || 0) + 3; standings[r.secondo] = (standings[r.secondo] || 0) + 1; });
  const ranking = Object.entries(standings).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
  const me = currentUser();
  const adminForm = me && me.role === 'admin' ? `<section class="card pad result-entry"><h2>Registra un risultato</h2><p class="muted">Inserisci il podio e il punteggio finale. I punti classifica vengono aggiornati automaticamente (3 al vincitore, 1 al secondo).</p><form data-form="result-entry"><div class="form-grid"><div class="field"><label for="result-torneo">Torneo</label><select id="result-torneo" name="torneoId" required>${getTornei().filter(t=>t.stato!=='cancellato').map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></div><div class="field"><label for="result-winner">Vincitore / squadra</label><input id="result-winner" name="vincitore" required maxlength="80"></div><div class="field"><label for="result-second">Secondo classificato</label><input id="result-second" name="secondo" required maxlength="80"></div><div class="field"><label for="result-score">Punteggio finale</label><input id="result-score" name="punteggio" required maxlength="30" placeholder="es. 13–9"></div></div><button class="btn btn-primary" type="submit">Salva risultato</button></form></section>` : '';
  return { title:'Risultati e classifica', html:`<section class="container page-head"><div class="section-head"><div><h1>Risultati e classifica</h1><p class="muted">Risultati ufficiali inseriti dagli amministratori e classifica cumulativa.</p></div></div>${adminForm}<div class="results-grid"><section class="card pad"><h2>Ultimi risultati</h2>${results.length ? `<div class="result-list">${results.map(r=>`<article class="result-row"><div class="result-trophy">${icon('trophy')}</div><div class="result-main"><h3>${esc(r.torneo.nome)}</h3><p><strong>${esc(r.vincitore)}</strong> <span class="muted">ha vinto contro</span> ${esc(r.secondo)}</p><small>${esc(fmtStamp(r.data))}</small></div><span class="score-pill">${esc(r.punteggio)}</span></article>`).join('')}</div>` : emptyBox('Nessun risultato pubblicato','Gli amministratori possono registrare i risultati dei tornei conclusi.')}</section><section class="card pad"><h2>Classifica generale</h2>${ranking.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Giocatore / squadra</th><th>Punti</th></tr></thead><tbody>${ranking.map(([name,pts],i)=>`<tr><td><span class="rank-number">${i+1}</span></td><td>${esc(name)}</td><td><strong>${pts}</strong></td></tr>`).join('')}</tbody></table></div>` : emptyBox('Classifica non disponibile','La classifica si popola dopo la pubblicazione dei primi risultati.')}</section></div></section>` };
}

function viewAttesa() {
  const me = currentUser(); const queue = getAttesa().filter(q => same(q.userId, me.id)).sort((a,b)=>a.data.localeCompare(b.data));
  return { title:'La mia lista d’attesa', html:`<section class="container page-head"><div class="section-head"><div><h1>Lista d’attesa</h1><p class="muted">Se si libera un posto, chi è in coda può iscriversi al torneo dalla sua scheda.</p></div></div>${queue.length ? `<div class="my-list">${queue.map((q,i)=>{const t=getTorneo(q.torneoId);return t?`<article class="my-item"><span class="my-emoji">${gameIco(gameOf(t))}</span><div class="my-main"><h3><a href="#/torneo/${t.id}">${esc(t.nome)}</a></h3><p class="muted">Posizione in coda: ${getAttesa().filter(x=>x.torneoId===t.id).sort((a,b)=>a.data.localeCompare(b.data)).findIndex(x=>x.id===q.id)+1} – inserito il ${esc(fmtStamp(q.data))}</p></div><button class="btn btn-outline btn-sm" data-action="leave-waitlist" data-id="${t.id}">Lascia lista</button></article>`:''}).join('')}</div>` : emptyBox('Non sei in lista d’attesa','Quando un torneo è al completo puoi entrare in coda dalla sua scheda.','<a class="btn btn-primary" href="#/tornei">Esplora i tornei</a>')}</section>` };
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
        <div class="auth-head"><h1>Accedi</h1><p>Entra per iscriverti ai tornei e vedere il tuo profilo.</p></div>
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
        <div class="auth-head"><h1>Crea il tuo account</h1><p>Servono pochi dati per iscriverti ai tornei.</p></div>
        <form data-form="register" novalidate>
          <div class="form-grid">
            ${field({ name: 'nome', label: 'Nome', autocomplete: 'given-name', attrs: 'autofocus maxlength="40"' })}
            ${field({ name: 'cognome', label: 'Cognome', autocomplete: 'family-name', attrs: 'maxlength="40"' })}
          </div>
          ${field({ name: 'nickname', label: 'Gamertag / Nickname', autocomplete: 'nickname', attrs: 'maxlength="50"' })}
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
