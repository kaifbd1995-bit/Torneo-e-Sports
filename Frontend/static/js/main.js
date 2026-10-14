/* Avvio dell'applicazione
 (script classico: condivide lo scope globale con gli altri file, vedi ordine in index.html) */
'use strict';

/* ---- Avvio ---- */
(async function init() {
  $('#year').textContent = new Date().getFullYear();
  await syncStateFromServer();
  await seed();
  await refreshData();  // sempre dopo seed: tornei, iscrizioni (e utenti per l'admin) arrivano dal DB reale
  await pushState();
  render(true);
})();
