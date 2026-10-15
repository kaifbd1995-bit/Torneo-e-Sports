package it.itslazio.esports;

import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DemoDataInitializer {

    @Bean
    CommandLineRunner seedDatabase(AppUserRepository users,
                                   TorneoRepository tornei,
                                   BCryptPasswordEncoder encoder) {
        return args -> {

            AppUser admin;
            if (!users.existsByEmailIgnoreCase("admin@itslazio.it")) {
                admin = new AppUser();
                admin.setNome("Admin");
                admin.setCognome("ITS Lazio");
                admin.setNickname("admin");
                admin.setEmail("admin@itslazio.it");
                admin.setRole("admin");
                admin.setPasswordHash(encoder.encode("Admin123!"));
                users.save(admin);
            } else {
                admin = users.findByEmailIgnoreCase("admin@itslazio.it").orElseThrow();
                admin.setPasswordHash(encoder.encode("Admin123!"));
                users.save(admin);
            }

            if (!users.existsByEmailIgnoreCase("mario.rossi@example.com")) {
                AppUser mario = new AppUser();
                mario.setNome("Mario");
                mario.setCognome("Rossi");
                mario.setNickname("MarioR");
                mario.setEmail("mario.rossi@example.com");
                mario.setPasswordHash(encoder.encode("Password123"));
                mario.setRole("user");
                users.save(mario);
            } else {
                AppUser mario = users.findByEmailIgnoreCase("mario.rossi@example.com").orElseThrow();
                mario.setPasswordHash(encoder.encode("Password123"));
                users.save(mario);
            }

            if (tornei.count() == 0) {
                LocalDate oggi = LocalDate.now();

                Torneo t1 = new Torneo();
                t1.setNome("Valorant Campus Cup");
                t1.setGioco("Valorant");
                t1.setStato(Torneo.Stato.aperto);
                t1.setInizioIscrizioni(oggi.minusDays(5));
                t1.setFineIscrizioni(oggi.plusDays(10));
                t1.setMaxPartecipanti(16);
                t1.setDescrizione("Il torneo 5v5 più atteso del campus. Fase a gironi seguita da eliminazione diretta al meglio dei tre round.");

                Torneo t2 = new Torneo();
                t2.setNome("Rocket League 3v3 Showdown");
                t2.setGioco("Rocket League");
                t2.setStato(Torneo.Stato.in_corso);
                t2.setInizioIscrizioni(oggi.minusDays(20));
                t2.setFineIscrizioni(oggi.minusDays(7));
                t2.setMaxPartecipanti(9);
                t2.setDescrizione("Tre squadre da tre giocatori si sfidano in un girone all'italiana. Partite ogni giovedì.");

                Torneo t3 = new Torneo();
                t3.setNome("FC 27 Winter League");
                t3.setGioco("FC 27");
                t3.setStato(Torneo.Stato.aperto);
                t3.setInizioIscrizioni(oggi);
                t3.setFineIscrizioni(oggi.plusDays(20));
                t3.setMaxPartecipanti(32);
                t3.setDescrizione("Campionato 1v1 a eliminazione diretta con squadre di club a scelta.");

                Torneo t4 = new Torneo();
                t4.setNome("League of Legends Clash ITS");
                t4.setGioco("League of Legends");
                t4.setStato(Torneo.Stato.chiuso);
                t4.setInizioIscrizioni(oggi.minusDays(60));
                t4.setFineIscrizioni(oggi.minusDays(40));
                t4.setMaxPartecipanti(10);
                t4.setDescrizione("Torneo concluso: dieci invocatori, due squadre estratte a sorte per ogni round.");

                Torneo t5 = new Torneo();
                t5.setNome("Minecraft Build Battle");
                t5.setGioco("Minecraft");
                t5.setStato(Torneo.Stato.cancellato);
                t5.setInizioIscrizioni(oggi.minusDays(30));
                t5.setFineIscrizioni(oggi.minusDays(10));
                t5.setMaxPartecipanti(20);
                t5.setDescrizione("Gara di costruzione a tema città del futuro. Annullato per indisponibilità server.");

                tornei.save(t1);
                tornei.save(t2);
                tornei.save(t3);
                tornei.save(t4);
                tornei.save(t5);
            }
        };
    }
}

/*
Questo file popola il database all'avvio dell'applicazione creando automaticamente l'utente admin, 
un utente di prova e alcuni tornei di esempio (se non sono già presenti). 
Inoltre, ad ogni avvio provvede ad aggiornare e resettare le password predefinite degli utenti demo 
per l'ambiente di sviluppo.
    */
