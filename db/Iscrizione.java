package it.itslazio.esports;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Entità che rappresenta l'iscrizione di un utente a un torneo.
 *
 * Tabella MySQL: iscrizioni
 *
 * Query utili:
 *   -- Tutti gli iscritti a un torneo:
 *   SELECT u.nome, u.cognome, u.email, i.created_at
 *     FROM iscrizioni i
 *     JOIN app_users u ON u.id = i.user_id
 *    WHERE i.torneo_id = :torneoId;
 *
 *   -- Tornei a cui è iscritto un utente:
 *   SELECT t.* FROM tornei t
 *     JOIN iscrizioni i ON i.torneo_id = t.id
 *    WHERE i.user_id = :userId;
 *
 *   -- Conteggio iscritti per torneo:
 *   SELECT torneo_id, COUNT(*) AS totale
 *     FROM iscrizioni
 *    GROUP BY torneo_id;
 */
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

    // ── Getters & Setters ────────────────────────────────────────────────────────
    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public Torneo getTorneo() { return torneo; }
    public void setTorneo(Torneo torneo) { this.torneo = torneo; }
    public Instant getCreatedAt() { return createdAt; }
}
