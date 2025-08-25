-- db.sql
-- Create the database and the users table

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`email`)
);

-- Table for additional user details
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_user_profiles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`)
    ON DELETE CASCADE
);
