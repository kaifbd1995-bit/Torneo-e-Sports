package it.itslazio.esports;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface TorneoRepository extends JpaRepository<Torneo, Long> {

    List<Torneo> findByStatoOrderByFineIscrizioniAsc(Torneo.Stato stato);

    @Query("SELECT t FROM Torneo t WHERE t.stato IN :stati ORDER BY t.fineIscrizioni ASC")
    List<Torneo> findByStatiOrderByFineIscrizioni(@Param("stati") List<Torneo.Stato> stati);

    @Query("SELECT t FROM Torneo t ORDER BY t.createdAt DESC")
    List<Torneo> findAllOrderByCreatedAtDesc();
}
/*

Questo file e un repository JPA che gestisce le interrogazioni dei tornei nel database.
    Fornisce metodi per recuperare i tornei filtrandoli per stato 
    (come aperti o in corso) e ordinandoli per data di scadenza o di creazione.
    */
