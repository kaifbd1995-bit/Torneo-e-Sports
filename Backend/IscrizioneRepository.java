package it.itslazio.esports;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface IscrizioneRepository extends JpaRepository<Iscrizione, Long> {

    Optional<Iscrizione> findByUserIdAndTorneoId(Long userId, Long torneoId);

    long countByTorneoId(Long torneoId);

    List<Iscrizione> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT i FROM Iscrizione i JOIN FETCH i.user WHERE i.torneo.id = :torneoId ORDER BY i.createdAt ASC")
    List<Iscrizione> findByTorneoIdWithUser(@Param("torneoId") Long torneoId);

    boolean existsByUserIdAndTorneoId(Long userId, Long torneoId);

    void deleteByTorneoId(Long torneoId);
}




/*
Questo file e un repository JPA che gestisce le iscrizioni ai tornei nel database.
Fornisce metodi per verificare se un utente e gia iscritto, contare i partecipanti,
recuperare la lista degli iscritti e cancellare le iscrizioni associate a un torneo.
    */

