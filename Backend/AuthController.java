package it.itslazio.esports;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller autenticazione.
 *
 * POST /api/auth/register – registra un nuovo utente
 * POST /api/auth/login – login, restituisce JWT
 * GET /api/auth/me – profilo dell'utente autenticato (richiede Bearer token)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository users;
    private final BCryptPasswordEncoder encoder;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    public AuthController(AppUserRepository users, BCryptPasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    // ── DTO / Record ─────────────────────────────────────────────────────────────

    public record RegisterRequest(
            @NotBlank @Size(max = 80) String nome,
            @NotBlank @Size(max = 80) String cognome,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Size(min = 8, max = 100) String password) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record UserDto(
            Long id,
            String nome,
            String cognome,
            String email,
            String role,
            Instant createdAt) {
    }

    // ── Endpoints ────────────────────────────────────────────────────────────────

    /** Registrazione nuovo utente */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email già registrata!");
        }
        AppUser user = new AppUser();
        user.setNome(request.nome().trim());
        user.setCognome(request.cognome().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(request.password()));
        user.setRole("user");
        user = users.save(user);
        return Map.of(
                "messaggio", "Utente registrato con successo!",
                "accessToken", buildToken(user),
                "tokenType", "Bearer",
                "user", toDto(user));
    }

    /** Login */
    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(u -> encoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenziali non valide"));
        return Map.of(
                "accessToken", buildToken(user),
                "tokenType", "Bearer",
                "user", toDto(user));
    }

    /** Profilo utente autenticato */
    @GetMapping("/me")
    public UserDto me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non autenticato");
        }
        Long userId = Long.valueOf((String) auth.getPrincipal());
        AppUser user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));
        return toDto(user);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private UserDto toDto(AppUser u) {
        return new UserDto(u.getId(), u.getNome(), u.getCognome(), u.getEmail(), u.getRole(), u.getCreatedAt());
    }

    private String buildToken(AppUser u) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(u.getId()))
                .claim("email", u.getEmail())
                .claim("role", u.getRole())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }
}


