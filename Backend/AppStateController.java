package it.itslazio.esports;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/state")
public class AppStateController {
    private final AppStateRepository repository;
    private final ObjectMapper mapper;
    public AppStateController(AppStateRepository repository, ObjectMapper mapper) {
        this.repository = repository; this.mapper = mapper;
    }

    @GetMapping
    public Map<String, JsonNode> all() {
        Map<String, JsonNode> result = new LinkedHashMap<>();
        repository.findAll().forEach(row -> {
            try { result.put(row.getStateKey(), mapper.readTree(row.getStateValue())); }
            catch (JsonProcessingException ignored) { /* ignora righe corrotte, senza bloccare la home */ }
        });
        return result;
    }

    @PutMapping("/{key}")
    public Map<String, Object> save(@PathVariable String key, @RequestBody JsonNode value) {
        if (!key.matches("itsx\\.[a-zA-Z0-9._-]{1,110}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chiave non valida");
        }
        try {
            String json = mapper.writeValueAsString(value);
            AppState row = repository.findById(key).orElseGet(() -> new AppState(key, json));
            row.setStateValue(json);
            repository.save(row);
            return Map.of("ok", true, "key", key);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "JSON non valido");
        }
    }
}


/*
Questo controller gestisce la lettura e il salvataggio dello stato globale dell'applicazione 
tramite API REST sotto la rotta /api/state. 
Converte e memorizza i dati JSON nel database controllando che le chiavi abbiano un prefisso valido 
(`itsx.`) e siano ben formate.
    */
