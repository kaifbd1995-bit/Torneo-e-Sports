package it.itslazio.esports;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


@RestController
public class TorneoController {

    private final TorneoRepository tornei;
    private final IscrizioneRepository iscrizioni;
    private final AppUserRepository users;
    private final ImpostazioniService impostazioni;

    public TorneoController(TorneoRepository tornei,
                            IscrizioneRepository iscrizioni,
                            AppUserRepository users,
                            ImpostazioniService impostazioni) {
        this.tornei = tornei;
        this.iscrizioni = iscrizioni;
        this.users = users;
        this.impostazioni = impostazioni;
    }


    record TorneoDto(
        Long id, String nome, String gioco,
        String inizioIscrizioni, String fineIscrizioni,
        int maxPartecipanti, long iscritti,
        String stato, String descrizione, Instant createdAt
    ) {}

    record IscrittoDto(Long id, String nome, String cognome, String email, Instant iscrittoAl) {}


    @GetMapping("/api/tornei")
    public List<TorneoDto> all() {
        return tornei.findAllOrderByCreatedAtDesc().stream()
            .map(this::toDto)
            .toList();
    }

    @GetMapping("/api/tornei/attivi")
    public List<TorneoDto> attivi() {
        return tornei.findByStatiOrderByFineIscrizioni(
            List.of(Torneo.Stato.aperto, Torneo.Stato.in_corso)
        ).stream().map(this::toDto).toList();
    }

    @GetMapping("/api/tornei/{id}")
    public TorneoDto detail(@PathVariable Long id) {
        return toDto(tornei.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo non trovato")));
    }

    @GetMapping("/api/tornei/{id}/iscritti")
    public List<IscrittoDto> iscritti(@PathVariable Long id) {
        tornei.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo non trovato"));
        return iscrizioni.findByTorneoIdWithUser(id).stream()
            .map(i -> new IscrittoDto(
                i.getUser().getId(),
                i.getUser().getNome(),
                i.getUser().getCognome(),
                i.getUser().getEmail(),
                i.getCreatedAt()
            )).toList();
    }

    @PostMapping("/api/tornei/{id}/iscrizione")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String, Object> iscriviti(@PathVariable Long id, Authentication auth) {
        Long userId = resolveUserId(auth);
        Torneo t = tornei.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo non trovato"));

        if (t.getStato() != Torneo.Stato.aperto) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Il torneo non è aperto alle iscrizioni");
        }
        long count = iscrizioni.countByTorneoId(id);
        if (count >= t.getMaxPartecipanti()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posti esauriti");
        }
        if (iscrizioni.existsByUserIdAndTorneoId(userId, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sei già iscritto a questo torneo");
        }

        AppUser user = users.findByIdForUpdate(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utente non trovato"));

       
        int max = impostazioni.getMaxTorneiPerUtente();
        long attive = iscrizioni.countByUserIdAndStati(userId, List.of(Torneo.Stato.aperto, Torneo.Stato.in_corso));
        if (attive >= max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Hai raggiunto il limite di " + max + (max == 1 ? " torneo" : " tornei")
                + " contemporanei: disiscriviti da un torneo per iscriverti a un altro");
        }

        try {
            Iscrizione i = new Iscrizione(user, t);
            iscrizioni.save(i);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Iscrizione già esistente");
        }

        return Map.of("messaggio", "Iscrizione effettuata con successo!", "torneoId", id);
    }

    @DeleteMapping("/api/tornei/{id}/iscrizione")
    public Map<String, Object> disiscriviti(@PathVariable Long id, Authentication auth) {
        Long userId = resolveUserId(auth);
        Torneo t = tornei.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo non trovato"));

        if (t.getStato() != Torneo.Stato.aperto) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Non puoi disiscriverti da un torneo non aperto");
        }

        Iscrizione i = iscrizioni.findByUserIdAndTorneoId(userId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Non sei iscritto a questo torneo"));
        iscrizioni.delete(i);

        return Map.of("messaggio", "Disiscrizione effettuata.", "torneoId", id);
    }


    @GetMapping("/api/utente/tornei")
    public List<TorneoDto> mieiTornei(Authentication auth) {
        Long userId = resolveUserId(auth);
        return iscrizioni.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(i -> toDto(i.getTorneo()))
            .toList();
    }


    private Long resolveUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Accesso negato: effettua il login");
        }
        try {
            return Long.valueOf((String) auth.getPrincipal());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ID Utente non valido");
        }
    }

    private TorneoDto toDto(Torneo t) {
        return new TorneoDto(
            t.getId(), t.getNome(), t.getGioco(),
            t.getInizioIscrizioni() == null ? null : t.getInizioIscrizioni().toString(),
            t.getFineIscrizioni() == null ? null : t.getFineIscrizioni().toString(),
            t.getMaxPartecipanti() == null ? 0 : t.getMaxPartecipanti(),
            iscrizioni.countByTorneoId(t.getId()),
            t.getStato() == null ? null : t.getStato().name(),
            t.getDescrizione(),
            t.getCreatedAt()
        );
    }
}



/*
Questo file e un controller Spring Boot che gestisce le API pubbliche e per gli utenti 
 autenticati relative ai tornei. Permette la consultazione 
dei tornei e degli iscritti, la gestione delle iscrizioni e disiscrizioni 
dell utente e il recupero dei propri tornei.
Nel metodo di iscrizione e stato aggiunto il controllo del limite massimo di tornei contemporanei 
a cui un utente puo iscriversi. 
Viene integrato il servizio delle impostazioni per recuperare questo limite e 
si verifica quante iscrizioni attive ha gia l utente, bloccando l operazione se il massimo viene superato.
    */

