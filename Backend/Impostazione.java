package it.itslazio.esports;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Impostazione globale dell'applicazione (coppia chiave/valore).
 *
 * Tabella MySQL: impostazioni (creata automaticamente da Hibernate).
 *
 * Query utili:
 *   SELECT * FROM impostazioni;
 *   -- Limite di tornei contemporanei per utente:
 *   SELECT valore FROM impostazioni WHERE chiave = 'max_tornei_per_utente';
 */
@Entity
@Table(name = "impostazioni")
public class Impostazione {

    @Id
    @Column(name = "chiave", length = 60, nullable = false)
    private String chiave;

    @Column(name = "valore", length = 255, nullable = false)
    private String valore;

    public Impostazione() {}

    public Impostazione(String chiave, String valore) {
        this.chiave = chiave;
        this.valore = valore;
    }

    public String getChiave() { return chiave; }
    public void setChiave(String chiave) { this.chiave = chiave; }
    public String getValore() { return valore; }
    public void setValore(String valore) { this.valore = valore; }
}
