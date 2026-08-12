

CREATE DATABASE IF NOT EXISTS estados_cidades
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE estados_cidades;


CREATE TABLE states (
    id         INT          NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50)  NOT NULL,
    uf         CHAR(2)      NOT NULL,

    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                     ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6)  NULL     DEFAULT NULL,

    PRIMARY KEY (id),

    KEY idx_states_uf (uf)
) ENGINE = InnoDB;


CREATE TABLE cities (
    id         INT          NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    state_id   INT          NOT NULL,

    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                     ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6)  NULL     DEFAULT NULL,

    PRIMARY KEY (id),

    KEY idx_cities_state_name (state_id, name),

    CONSTRAINT fk_cities_state
        FOREIGN KEY (state_id) REFERENCES states (id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT
) ENGINE = InnoDB;
