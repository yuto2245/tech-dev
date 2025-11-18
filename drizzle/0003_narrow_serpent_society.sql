CREATE TABLE `articleCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('github','zenn','qita') NOT NULL,
	`sourceId` varchar(255) NOT NULL,
	`userId` int,
	`title` text NOT NULL,
	`description` text,
	`author` varchar(255) NOT NULL,
	`authorId` varchar(255),
	`url` text NOT NULL,
	`emoji` varchar(10),
	`topics` text,
	`publishedAt` timestamp,
	`htmlContent` text,
	`frontmatter` text,
	`toc` text,
	`cachedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `articleCache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `factCheckCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`sourceType` enum('github','zenn','qita') NOT NULL,
	`sourceId` varchar(255) NOT NULL,
	`aiModel` varchar(100) NOT NULL DEFAULT 'gpt-4o',
	`status` enum('completed','failed','no_libraries_found') NOT NULL,
	`aiMessage` text,
	`libraries` text,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `factCheckCache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userGithubRepositories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`owner` varchar(255) NOT NULL,
	`repo` varchar(255) NOT NULL,
	`contentDir` varchar(255) NOT NULL DEFAULT 'articles',
	`isActive` int NOT NULL DEFAULT 1,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userGithubRepositories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPlatformConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('github','zenn','qita') NOT NULL,
	`platformUserId` varchar(255) NOT NULL,
	`platformUsername` varchar(255) NOT NULL,
	`accessToken` varchar(1024),
	`isConnected` int NOT NULL DEFAULT 1,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPlatformConnections_id` PRIMARY KEY(`id`)
);
