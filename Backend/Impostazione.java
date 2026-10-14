package it.itslazio.esports;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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



/*
Questo file e l entita Impostazione per la mappatura della tabella delle impostazioni globali 
nel database tramite JPA (cite: 15). Memorizza le configurazioni di sistema come 
coppie chiave e valore, permettendo di salvare e recuperare parametri dell applicazione come 
il limite massimo di tornei per utente.
    */
