package it.itslazio.esports;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_users", uniqueConstraints = @UniqueConstraint(name = "uk_app_users_email", columnNames = "email"))
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80) private String nome;
    @Column(nullable = false, length = 80) private String cognome;
    @Column(length = 50) private String nickname;
    @Column(nullable = false, length = 190) private String email;
    @Column(nullable = false, length = 100) private String passwordHash;
    @Column(nullable = false, length = 20) private String role = "user";
    @Column(nullable = false) private Instant createdAt;

    public AppUser() {}

    @PrePersist 
    public void onCreate() { 
        if (createdAt == null) createdAt = Instant.now(); 
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCognome() { return cognome; }
    public void setCognome(String cognome) { this.cognome = cognome; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email == null ? null : email.trim().toLowerCase(); }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Instant getCreatedAt() { return createdAt; }
}


/*
Questo file rappresenta l'entità **`AppUser`** per la mappatura dell'utente nel database tramite JPA.
Conserva le informazioni del profilo (nome, cognome, email, hash della password e ruolo)
e imposta automaticamente la data di registrazione (`createdAt`).
    */
