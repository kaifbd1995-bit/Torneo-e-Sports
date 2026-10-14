package it.itslazio.esports;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppStateRepository extends JpaRepository<AppState, String> {}



/*
Questo file è un'interfaccia Repository di Spring Data JPA** per la gestione dell'entità AppState. 
Fornisce in automatico le operazioni CRUD fondamentali 
(salvataggio, ricerca, aggiornamento ed eliminazione) sul database 
utilizzando la chiave primario di tipo stringa (String).
*/
