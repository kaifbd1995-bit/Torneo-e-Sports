package it.itslazio.esports;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository per i tornei.
 *
 * -- Query native equivalenti (MySQL):
 *
 * -- Tornei aperti o in corso (homepage pubblica):
 * SELECT * FROM tornei
 *  WHERE stato IN ('aperto','in_corso')
 *  ORDER BY fine_iscrizioni ASC;
 *
 * -- Tutti i tornei ordinati per data creazione:
 * SELECT * FROM tornei ORDER BY created_at DESC;
 */
public interface TorneoRepository extends JpaRepository<Torneo, Long> {

    /** Tornei in un determinato stato */
    List<Torneo> findByStatoOrderByFineIscrizioniAsc(Torneo.Stato stato);

    /** Tornei in più stati (per homepage: aperto o in_corso) */
    @Query("SELECT t FROM Torneo t WHERE t.stato IN :stati ORDER BY t.fineIscrizioni ASC")
    List<Torneo> findByStatiOrderByFineIscrizioni(@Param("stati") List<Torneo.Stato> stati);

    /** Tutti i tornei dalla data più recente */
    @Query("SELECT t FROM Torneo t ORDER BY t.createdAt DESC")
    List<Torneo> findAllOrderByCreatedAtDesc();
}
