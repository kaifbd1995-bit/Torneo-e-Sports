package it.itslazio.esports;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final TorneoRepository tornei;
    private final IscrizioneRepository iscrizioni;
    private final AppUserRepository users;

    public AdminController(TorneoRepository tornei,
                           IscrizioneRepository iscrizioni,
                           AppUserRepository users) {
        this.tornei = tornei;
        this.iscrizioni = iscrizioni;
        this.users = users;
    }

    public record TorneoRequest(
        @NotBlank @Size(max = 120) String nome,
        @Size(max = 80) String gioco,
        @NotNull LocalDate inizioIscrizioni,
        @NotNull LocalDate fineIscrizioni,
        @NotNull @Min(2) @Max(512) Integer maxPartecipanti,
        Torneo.Stato stato,
        @Size(max = 2000) String descrizione
    ) {}

    public record StatoRequest(@NotNull Torneo.Stato stato) {}

    record TorneoAdminDto(
        Long id, String nome, String gioco,
        String inizioIscrizioni, String fineIscrizioni,
        int maxPartecipanti, long iscritti,
        String stato, String descrizione, Instant createdAt
    ) {}

    record IscrittoDto(Long id, String nome, String cognome, String email, Instant iscrittoAl) {}

    record UtenteDto(Long id, String nome, String cognome, String email, String role, Instant createdAt) {}

    @GetMapping("/tornei")
    public List<TorneoAdminDto> allTornei() {
        return tornei.findAllOrderByCreatedAtDesc().stream()
            .map(this::toAdminDto)
            .toList();
    }

    @PostMapping("/tornei")
    @ResponseStatus(HttpStatus.CREATED)
    public TorneoAdminDto createTorneo(@Valid @RequestBody TorneoRequest req) {
        if (req.fineIscrizioni().isBefore(req.inizioIscrizioni())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "La data di fine iscrizioni non può precedere quella di inizio");
        }
        Torneo t = new Torneo();
        applyRequest(t, req);
        return toAdminDto(tornei.save(t));
    }

    @PutMapping("/tornei/{id}")
    public TorneoAdminDto updateTorneo(@PathVariable Long id,
                                       @Valid @RequestBody TorneoRequest req) {
        Torneo t = findTorneo(id);
        if (req.fineIscrizioni().isBefore(req.inizioIscrizioni())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "La data di fine iscrizioni non può precedere quella di inizio");
        }
        applyRequest(t, req);
        return toAdminDto(tornei.save(t));
    }

    @PutMapping("/tornei/{id}/stato")
    public TorneoAdminDto changeStato(@PathVariable Long id,
                                      @Valid @RequestBody StatoRequest req) {
        Torneo t = findTorneo(id);
        t.setStato(req.stato());
        return toAdminDto(tornei.save(t));
    }

    @DeleteMapping("/tornei/{id}")
    @Transactional
    public Map<String, Object> deleteTorneo(@PathVariable Long id) {
        Torneo t = findTorneo(id);
        iscrizioni.deleteByTorneoId(id);
        tornei.delete(t);
        return Map.of("messaggio", "Torneo eliminato con successo", "id", id);
    }

    @GetMapping("/tornei/{id}/iscritti")
    public List<IscrittoDto> iscritti(@PathVariable Long id) {
        findTorneo(id);
        return iscrizioni.findByTorneoIdWithUser(id).stream()
            .map(i -> new IscrittoDto(
                i.getUser().getId(),
                i.getUser().getNome(),
                i.getUser().getCognome(),
                i.getUser().getEmail(),
                i.getCreatedAt()
            )).toList();
    }

    /** Rimuove un iscritto da un torneo (azione admin) */
    @DeleteMapping("/tornei/{id}/iscritti/{userId}")
    @Transactional
    public Map<String, Object> rimuoviIscritto(@PathVariable Long id, @PathVariable Long userId) {
        findTorneo(id);
        Iscrizione i = iscrizioni.findByUserIdAndTorneoId(userId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Iscrizione non trovata"));
        iscrizioni.delete(i);
        return Map.of("messaggio", "Iscritto rimosso dal torneo", "torneoId", id, "userId", userId);
    }

    @GetMapping("/utenti")
    public List<UtenteDto> allUtenti() {
        return users.findAll().stream()
            .map(u -> new UtenteDto(
                u.getId(), u.getNome(), u.getCognome(),
                u.getEmail(), u.getRole(), u.getCreatedAt()
            )).toList();
    }

    private Torneo findTorneo(Long id) {
        return tornei.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo non trovato"));
    }

    private void applyRequest(Torneo t, TorneoRequest req) {
        t.setNome(req.nome().trim());
        t.setGioco(req.gioco());
        t.setInizioIscrizioni(req.inizioIscrizioni());
        t.setFineIscrizioni(req.fineIscrizioni());
        t.setMaxPartecipanti(req.maxPartecipanti());
        if (req.stato() != null) t.setStato(req.stato());
        t.setDescrizione(req.descrizione());
    }

    private TorneoAdminDto toAdminDto(Torneo t) {
        return new TorneoAdminDto(
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


