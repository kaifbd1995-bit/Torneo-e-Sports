package it.itslazio.esports;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM AppUser u WHERE u.id = :id")
    Optional<AppUser> findByIdForUpdate(@Param("id") Long id);
}

/*
Questo file è un **Repository JPA** per la gestione degli utenti (`AppUser`) nel database.
Oltre alle operazioni CRUD standard, fornisce metodi personalizzati per cercare un utente 
o verificarne l'esistenza tramite la sua email ignorando le lettere maiuscole/minuscole.
Nel nuovo file AppUserRepository e stato aggiunto il metodo findByIdForUpdate.
Questo metodo recupera l utente applicando un blocco pessimistico sulla riga del database
per gestire le richieste concorrenti ed evitare che piu iscrizioni simultanee superino il limite consentito.
    */
