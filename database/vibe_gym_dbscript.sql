-- Dumping database structure for vibe_gym_dev
CREATE DATABASE IF NOT EXISTS `vibe_gym_dev` 
USE `vibe_gym_dev`;

-- Dumping structure for table vibe_gym_dev.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int(10) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `cpf` char(11) NOT NULL,
  `dob` date NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) NOT NULL,
  `plan` varchar(15) NOT NULL,
  `sub_price` decimal(10,2) unsigned NOT NULL,
  `location` varchar(50) NOT NULL,
  `gender` enum('M','F','N/A') DEFAULT NULL,
  `cep` char(8) NOT NULL,
  `state` varchar(25) NOT NULL,
  `city` varchar(50) NOT NULL,
  `address_line1` varchar(100) NOT NULL,
  `address_num` char(4) DEFAULT NULL,
  `address_line2` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

