package it.itslazio.esports;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository JPA per la gestione dell'entità AppUser.
 * La chiave primaria dell'utente è di tipo Long.
 */
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    /** Trova un utente in base alla mail (case-insensitive) */
    Optional<AppUser> findByEmailIgnoreCase(String email);

    /** Verifica l'esistenza di un utente tramite email */
    boolean existsByEmailIgnoreCase(String email);
}

/*
Questo file è un **Repository JPA** per la gestione degli utenti (`AppUser`) nel database.
Oltre alle operazioni CRUD standard, fornisce metodi personalizzati per cercare un utente 
o verificarne l'esistenza tramite la sua email ignorando le lettere maiuscole/minuscole.
    */
