CREATE DATABASE IF NOT EXISTS its_lazio_esports
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE its_lazio_esports;

DROP TABLE IF EXISTS iscrizioni;
DROP TABLE IF EXISTS app_users;

-- Tabella utenti (ID numerico auto-incrementante)
CREATE TABLE IF NOT EXISTS app_users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(80)  NOT NULL,
    cognome       VARCHAR(80)  NOT NULL,
    email         VARCHAR(190) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user',
    created_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_app_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella tornei
CREATE TABLE IF NOT EXISTS tornei (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    nome               VARCHAR(120) NOT NULL,
    gioco              VARCHAR(80),
    inizio_iscrizioni  DATE         NOT NULL,
    fine_iscrizioni    DATE         NOT NULL,
    max_partecipanti   INT          NOT NULL,
    stato              VARCHAR(20)  NOT NULL DEFAULT 'aperto',
    descrizione        TEXT,
    created_at         DATETIME(6)  NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella iscrizioni (FK user_id collegata a BIGINT app_users.id)
CREATE TABLE IF NOT EXISTS iscrizioni (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    torneo_id  BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_iscrizioni_user_torneo UNIQUE (user_id, torneo_id),
    CONSTRAINT fk_iscrizioni_user   FOREIGN KEY (user_id)   REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_iscrizioni_torneo FOREIGN KEY (torneo_id) REFERENCES tornei(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserimento dati demo
INSERT INTO app_users (id, nome, cognome, email, password_hash, role, created_at)
VALUES
    (1, 'Admin', 'ITS Lazio', 'admin@itslazio.it', '2a10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVbQf.V5WC', 'admin', NOW(6)),
    (2, 'Mario', 'Rossi', 'mario.rossi@example.com', '2a10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVbQf.V5WC', 'user', NOW(6)),
    (3, 'Giulia', 'Bianchi', 'giulia.bianchi@example.com', '2a10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVbQf.V5WC', 'user', NOW(6));

INSERT INTO iscrizioni (user_id, torneo_id, created_at)
VALUES
    (2, 1, NOW(6)),
    (3, 1, NOW(6)),
    (2, 3, NOW(6));


