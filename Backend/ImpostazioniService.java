package it.itslazio.esports;

import org.springframework.stereotype.Service;

/**
 * Accesso alle impostazioni globali.
 * Il limite di tornei contemporanei per utente vale per TUTTI gli utenti
 * (non è un valore per singolo utente) e lo modifica solo l'amministratore.
 */
@Service
public class ImpostazioniService {

    public static final String CHIAVE_MAX_TORNEI = "max_tornei_per_utente";
    public static final int MAX_TORNEI_DEFAULT = 3;
    public static final int MAX_TORNEI_MIN = 1;
    public static final int MAX_TORNEI_MAX = 100;

    private final ImpostazioneRepository repository;

    public ImpostazioniService(ImpostazioneRepository repository) {
        this.repository = repository;
    }

    /** Numero massimo di tornei attivi (aperto / in corso) a cui un utente può essere iscritto. */
    public int getMaxTorneiPerUtente() {
        return repository.findById(CHIAVE_MAX_TORNEI)
            .map(Impostazione::getValore)
            .map(ImpostazioniService::parse)
            .orElse(MAX_TORNEI_DEFAULT);
    }

    public int setMaxTorneiPerUtente(int valore) {
        if (valore < MAX_TORNEI_MIN || valore > MAX_TORNEI_MAX) {
            throw new IllegalArgumentException("Valore fuori intervallo");
        }
        repository.save(new Impostazione(CHIAVE_MAX_TORNEI, String.valueOf(valore)));
        return valore;
    }

    private static int parse(String raw) {
        try {
            int v = Integer.parseInt(raw.trim());
            return (v >= MAX_TORNEI_MIN && v <= MAX_TORNEI_MAX) ? v : MAX_TORNEI_DEFAULT;
        } catch (NumberFormatException ex) {
            return MAX_TORNEI_DEFAULT;
        }
    }
}
