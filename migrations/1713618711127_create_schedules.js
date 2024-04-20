module.exports = {
    "up": `CREATE TABLE schedules
           (
               id INT(11) NOT NULL AUTO_INCREMENT,
               created_at DATETIME NOT NULL,
               title VARCHAR(64) NOT NULL,
               user_fk INT(11) NULL,
               timestamp DATETIME NOT NULL,
               PRIMARY KEY (id),
               CONSTRAINT schedules_user_fk FOREIGN KEY (user_fk) REFERENCES users (id),
               CONSTRAINT schedules_title_unique UNIQUE (title, timestamp)
           ) ENGINE=INNODB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4`,
    "down": "DROP TABLE schedules"
}
