CREATE TABLE `user_repositories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`owner` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`contentDir` varchar(255) NOT NULL DEFAULT 'articles',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_repositories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
