CREATE TABLE `scrapedArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceUrl` text NOT NULL,
	`title` text,
	`markdown` text NOT NULL,
	`htmlContent` text,
	`searchQuery` varchar(500),
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `scrapedArticles_id` PRIMARY KEY(`id`)
);
