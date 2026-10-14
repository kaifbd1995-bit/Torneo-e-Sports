package it.itslazio.esports;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository JPA per la gestione delle iscrizioni.
 * I filtri per userId accettano ora un parametro di tipo Long.
 */
public interface IscrizioneRepository extends JpaRepository<Iscrizione, Long> {

    /** Trova l'iscrizione di un utente a un determinato torneo */
    Optional<Iscrizione> findByUserIdAndTorneoId(Long userId, Long torneoId);

    /** Conta il numero totale di iscritti a un torneo */
    long countByTorneoId(Long torneoId);

    /** Restituisce la lista di tutte le iscrizioni di un utente, ordinate per data decrescente */
    List<Iscrizione> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Recupera gli iscritti di un torneo caricando contestualmente i dati dell'utente (JOIN FETCH) */
    @Query("SELECT i FROM Iscrizione i JOIN FETCH i.user WHERE i.torneo.id = :torneoId ORDER BY i.createdAt ASC")
    List<Iscrizione> findByTorneoIdWithUser(@Param("torneoId") Long torneoId);

    /** Verifica se un utente risulta già iscritto a un torneo */
    boolean existsByUserIdAndTorneoId(Long userId, Long torneoId);

    /** Elimina tutte le iscrizioni collegate a un torneo */
    void deleteByTorneoId(Long torneoId);
}


