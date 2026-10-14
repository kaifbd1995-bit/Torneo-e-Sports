package it.itslazio.esports;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;


@Entity
@Table(name = "tornei")
public class Torneo {

    public enum Stato { aperto, in_corso, chiuso, cancellato }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String nome;

    @Size(max = 80)
    @Column(length = 80)
    private String gioco;

    @NotNull
    @Column(name = "inizio_iscrizioni", nullable = false)
    private LocalDate inizioIscrizioni;

    @NotNull
    @Column(name = "fine_iscrizioni", nullable = false)
    private LocalDate fineIscrizioni;

    @NotNull
    @Min(2)
    @Max(512)
    @Column(name = "max_partecipanti", nullable = false)
    private Integer maxPartecipanti;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Stato stato = Stato.aperto;

    @Size(max = 2000)
    @Column(columnDefinition = "TEXT")
    private String descrizione;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getGioco() { return gioco; }
    public void setGioco(String gioco) { this.gioco = gioco; }
    public LocalDate getInizioIscrizioni() { return inizioIscrizioni; }
    public void setInizioIscrizioni(LocalDate inizioIscrizioni) { this.inizioIscrizioni = inizioIscrizioni; }
    public LocalDate getFineIscrizioni() { return fineIscrizioni; }
    public void setFineIscrizioni(LocalDate fineIscrizioni) { this.fineIscrizioni = fineIscrizioni; }
    public Integer getMaxPartecipanti() { return maxPartecipanti; }
    public void setMaxPartecipanti(Integer maxPartecipanti) { this.maxPartecipanti = maxPartecipanti; }
    public Stato getStato() { return stato; }
    public void setStato(Stato stato) { this.stato = stato; }
    public String getDescrizione() { return descrizione; }
    public void setDescrizione(String descrizione) { this.descrizione = descrizione; }
    public Instant getCreatedAt() { return createdAt; }
}



/*
Questo file rappresenta l'entità **`Torneo`** per la mappatura dei tornei eSports 
nel database tramite JPA. Definisce i campi principali 
(nome, gioco, date di iscrizione, numero massimo di partecipanti, stato ed eventuale descrizione) 
insieme ai vincoli di validazione dei dati.
    */
