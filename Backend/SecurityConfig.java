package it.itslazio.esports;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configurazione Spring Security:
 *  - stateless (JWT, nessuna sessione HTTP)
 *  - CSRF disabilitato (API REST)
 *  - Rotte pubbliche: GET /api/tornei/**, POST /api/auth/**
 *  - Rotte utente: POST/DELETE /api/tornei/{id}/iscrizione, GET /api/utente/**
 *  - Rotte admin: /api/admin/**  (solo ROLE_ADMIN)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── Risorse statiche e pagine ─────────────────────────────────────
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/img/**", "/favicon.ico").permitAll()
                // ── Autenticazione pubblica ───────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                // ── Tornei: lettura pubblica ──────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/tornei/**").permitAll()
                // ── Stato app (legacy) ────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/state/**").permitAll()
                // ── Iscrizioni: richiede login ────────────────────────────────────
                .requestMatchers("/api/tornei/*/iscrizione").authenticated()
                // ── Profilo utente ────────────────────────────────────────────────
                .requestMatchers("/api/utente/**").authenticated()
                // ── Dashboard admin ───────────────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // ── Tutto il resto richiede autenticazione ────────────────────────
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
