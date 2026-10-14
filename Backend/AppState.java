package it.itslazio.esports;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;

@Entity
@Table(name = "app_state")
public class AppState {
    @Id
    @Column(length = 120, nullable = false)
    private String stateKey;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String stateValue;

    @Column(nullable = false)
    private Instant updatedAt;

    public AppState() {}
    public AppState(String stateKey, String stateValue) {
        this.stateKey = stateKey;
        this.stateValue = stateValue;
        this.updatedAt = Instant.now();
    }
    @PrePersist @PreUpdate public void touch() { updatedAt = Instant.now(); }
    public String getStateKey() { return stateKey; }
    public void setStateKey(String stateKey) { this.stateKey = stateKey; }
    public String getStateValue() { return stateValue; }
    public void setStateValue(String stateValue) { this.stateValue = stateValue; }
    public Instant getUpdatedAt() { return updatedAt; }
}


/*
Questo file rappresenta l'entità **`AppState`** per la persistenza del database tramite JPA.
Serve a memorizzare impostazioni o configurazioni dell'applicazione
sotto forma di chiavi e valori (`stateKey` e `stateValue`),
aggiornando automaticamente la data e l'ora dell'ultima modifica (`updatedAt`).
*/
