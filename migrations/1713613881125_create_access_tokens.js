module.exports = {
    "up": `CREATE TABLE access_tokens
           (
               id INT(11) NOT NULL AUTO_INCREMENT,
               user_fk INT(11) NOT NULL,
               access_token VARCHAR(36) NOT NULL,
               created_at DATETIME NOT NULL,
               expires_at DATETIME NOT NULL,
               PRIMARY KEY (id),
               CONSTRAINT access_token_access_token_index UNIQUE (access_token),
               CONSTRAINT access_token_user_fk FOREIGN KEY (user_fk) REFERENCES users (id),
               INDEX access_token_user_access_token_index (user_fk, access_token)
           ) ENGINE=INNODB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4`,
    "down": "DROP TABLE access_tokens"
}
