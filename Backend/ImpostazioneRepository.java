package it.itslazio.esports;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ImpostazioneRepository extends JpaRepository<Impostazione, String> {}



/*
Questo file e un repository JPA per la gestione delle impostazioni nel database. 
Estende JpaRepository e fornisce i metodi standard per leggere e salvare la configurazione 
delle impostazioni di sistema usando la chiave come identificatore.
  */
