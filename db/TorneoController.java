package it.itslazio.esports;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller pubblico e utente per i tornei.
 *
 * ── Pubbliche (nessun token richiesto) ────────────────────────────────────────
 * GET  /api/tornei                  – tutti i tornei
 * GET  /api/tornei/attivi           – tornei aperto o in_corso
 * GET  /api/tornei/{id}             – dettaglio singolo torneo
 * GET  /api/tornei/{id}/iscritti    – lista iscritti di un torneo
 *
 * ── Richiede autenticazione (Bearer token) ────────────────────────────────────
 * POST   /api/tornei/{id}/iscrizione    – iscriviti a un torneo
 * DELETE /api/tornei/{id}/iscrizione    – disiscriviti da un torneo
 * GET    /api/utente/tornei             – tornei dell'utente autenticato
 */
@RestController
public class TorneoController {

    private final TorneoRepository tornei;
    private final IscrizioneRepository iscrizioni;
    private final AppUserRepository users;

    public TorneoController(TorneoRepository tornei,
                            IscrizioneRepository iscrizioni,
                            AppUserRepository users) {
        this.tornei = tornei;
        this.iscrizioni = iscrizioni;
        this.users = users;
    }

    // ── DTO ──────────────────────────────────────────────────────────────────────

    record TorneoDto(
        Long id, String nome, String gioco,
        String inizioIscrizioni, String fineIscrizioni,
        int maxPartecipanti, long iscritti,
        String stato, String descrizione, Instant createdAt
    ) {}

    record IscrittoDto(Long id, String nome, String cognome, String email, Instant iscrittoAl) {}

    // ── Endpoints pubblici ───────────────────────────────────────────────────────

    /** Tutti i tornei (con conteggio iscritti) */
    @GetMapping("/api/tornei")
    public List<TorneoDto> all() {
        return tornei.findAllOrderByCreatedAtDesc().stream()
            .map(this::toDto)
            .toList();
    }

    /** Solo tornei aperti o in corso */
    @GetMapping("/api/tornei/attivi")
    public List<TorneoDto> attivi() {
        return tornei.findByStatiOrderByFineIscrizioni(
            List.of(Torneo.Stato.aperto, Torneo.Stato.in_corso)
        ).stream().map(this::toDto).toList();
    }

    /** Dettaglio torneo */
    @GetMapping("/api/tornei/{id}")
    public TorneoDto detail(@PathVariable Long id) {
        return toDto(tornei.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo non trovato")));
    }

    /** Lista iscritti di un torneo */
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

    // ── Iscrizioni (autenticato) ─────────────────────────────────────────────────

    /** Iscriviti a un torneo */
    @PostMapping("/api/tornei/{id}/iscrizione")
    @ResponseStatus(HttpStatus.CREATED)
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

        AppUser user = users.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utente non trovato"));

        try {
            Iscrizione i = new Iscrizione(user, t);
            iscrizioni.save(i);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Iscrizione già esistente");
        }

        return Map.of("messaggio", "Iscrizione effettuata con successo!", "torneoId", id);
    }

    /** Disiscriviti da un torneo */
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

    // ── Profilo utente ───────────────────────────────────────────────────────────

    /** Tornei a cui è iscritto l'utente autenticato */
    @GetMapping("/api/utente/tornei")
    public List<TorneoDto> mieiTornei(Authentication auth) {
        Long userId = resolveUserId(auth);
        return iscrizioni.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(i -> toDto(i.getTorneo()))
            .toList();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

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


