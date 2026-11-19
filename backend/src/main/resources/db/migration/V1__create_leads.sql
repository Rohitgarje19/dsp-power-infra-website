-- Baseline schema for the DSP lead desk.
-- Matches the schema previously managed by Hibernate ddl-auto=update.
-- Existing databases are baselined at version 1 (see spring.flyway.baseline-version);
-- fresh databases run this migration, then Hibernate validates against it.

CREATE TABLE `leads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(160) DEFAULT NULL,
  `customer_type` varchar(40) NOT NULL,
  `city` varchar(100) NOT NULL,
  `pincode` varchar(6) NOT NULL,
  `monthly_bill` int DEFAULT NULL,
  `message` varchar(1200) DEFAULT NULL,
  `source` varchar(40) NOT NULL,
  `source_page` varchar(200) DEFAULT NULL,
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `notes` varchar(2000) DEFAULT NULL,
  `status` varchar(40) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_leads_created_at` (`created_at`),
  KEY `idx_leads_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;