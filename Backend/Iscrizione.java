package it.itslazio.esports;

import jakarta.persistence.*;
import java.time.Instant;


 
@Entity
@Table(
    name = "iscrizioni",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_iscrizioni_user_torneo",
        columnNames = { "user_id", "torneo_id" }
    )
)
public class Iscrizione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "torneo_id", nullable = false)
    private Torneo torneo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Iscrizione() {}

    public Iscrizione(AppUser user, Torneo torneo) {
        this.user = user;
        this.torneo = torneo;
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public Torneo getTorneo() { return torneo; }
    public void setTorneo(Torneo torneo) { this.torneo = torneo; }
    public Instant getCreatedAt() { return createdAt; }
}

/*
Questo file rappresenta l'entità **`Iscrizione`** per la mappatura della tabella di giunzione 
nel database tramite JPA. Gestisce la relazione molti-a-molti tra utenti (`AppUser`) e tornei (`Torneo`), 
registrando automaticamente la data e l'ora di iscrizione ed evitando iscrizioni 
duplicate tramite un vincolo di unicità (`user_id`, `torneo_id`).
    */
