package it.itslazio.esports;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

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




/*
Questo file è un controller REST riservato agli amministratori per la gestione delle impostazioni globali.
Espone endpoint per consultare e modificare il limite massimo di tornei a cui un utente
può essere iscritto contemporaneamente.
    */
