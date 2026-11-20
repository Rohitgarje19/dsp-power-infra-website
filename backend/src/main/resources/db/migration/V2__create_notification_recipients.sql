-- Recipient inboxes for new-enquiry notification emails.
-- Managed from the admin desk; the server's NOTIFY_TO address (if set) is
-- always included as a fallback.

CREATE TABLE `notification_recipients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `label` varchar(80) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notification_recipients_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
