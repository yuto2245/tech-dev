ALTER TABLE `users` ADD `blogFont` varchar(64) DEFAULT 'openai-sans';
CREATE TABLE `user_repositories` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `owner` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contentDir` varchar(255) NOT NULL DEFAULT 'articles',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP
);
