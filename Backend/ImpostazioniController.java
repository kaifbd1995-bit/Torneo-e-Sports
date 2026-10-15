package it.itslazio.esports;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/**
 * Impostazioni globali.
 *
 * GET /api/admin/settings/max-tornei – solo ADMIN: limite di tornei per utente
 * PUT /api/admin/settings/max-tornei – solo ADMIN: modifica il limite (vale per tutti gli utenti)
 */
@RestController
public class ImpostazioniController {

    private final ImpostazioniService impostazioni;

    public ImpostazioniController(ImpostazioniService impostazioni) {
        this.impostazioni = impostazioni;
    }

    public record ImpostazioniRequest(
        @NotNull @Min(ImpostazioniService.MAX_TORNEI_MIN) @Max(ImpostazioniService.MAX_TORNEI_MAX)
        Integer maxTornei
    ) {}

    @GetMapping("/api/admin/settings/max-tornei")
    public Map<String, Object> get() {
        return Map.of("maxTornei", impostazioni.getMaxTorneiPerUtente());
    }

    @PutMapping("/api/admin/settings/max-tornei")
    public Map<String, Object> update(@Valid @RequestBody ImpostazioniRequest req) {
        int v = impostazioni.setMaxTorneiPerUtente(req.maxTornei());
        return Map.of("maxTornei", v);
    }
}
