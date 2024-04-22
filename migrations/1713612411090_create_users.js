module.exports = {
    "up": `CREATE TABLE users (
               id INT(11) NOT NULL AUTO_INCREMENT,
               created_at DATETIME NOT NULL,
               username VARCHAR(64) NOT NULL,
               in_game_name VARCHAR(64) NOT NULL,
               auth_code_url VARCHAR(1028) NOT NULL,
               verified INT(1) NOT NULL DEFAULT 0,
               verification_code VARCHAR(64) NOT NULL,
               verified_by_fk INT(11) NULL,
               admin INT(1) NOT NULL DEFAULT 0,
               promoted_by_fk INT(11) NULL,
               PRIMARY KEY (id),
               CONSTRAINT users_username_unique UNIQUE (username),
               CONSTRAINT users_in_game_name_unique UNIQUE (in_game_name),
               CONSTRAINT users_verified_by_fk FOREIGN KEY (verified_by_fk) REFERENCES users (id),
               CONSTRAINT users_promoted_by_fk FOREIGN KEY (promoted_by_fk) REFERENCES users (id)
           ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4`,
    "down": "DROP TABLE users"
}
