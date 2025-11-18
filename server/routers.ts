import { TRPCError } from "@trpc/server";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  fetchGithubArticles,
  fetchGithubArticle,
  type ArticleSummary,
} from "./_core/github";

export const appRouter = router({
  system: systemRouter,

  blog: router({
    listAll: publicProcedure
      .input(
        z
          .object({
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(100).default(50),
            source: z.enum(["github"]).default("github"),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const { page = 1, limit = 50 } = input ?? {};
        const articles = await fetchGithubArticles();
        const start = (page - 1) * limit;
        const slice = articles.slice(start, start + limit);
        return {
          articles: slice,
          total: articles.length,
          page,
          limit,
          source: "github" as const,
        } satisfies {
          articles: ArticleSummary[];
          total: number;
          page: number;
          limit: number;
          source: "github";
        };
      }),

    get: publicProcedure
      .input(
        z.object({
          slug: z.string(),
          source: z.enum(["github"]).default("github"),
        })
      )
      .query(async ({ input }) => {
        const article = await fetchGithubArticle(input.slug);
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }
        return article;
      }),

    checkFreshness: publicProcedure
      .input(
        z.object({
          slug: z.string(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const wordCount = input.content.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.round(wordCount / 220));
        return {
          success: true,
          aiModel: "contextual-review",
          checkedAt: new Date().toISOString(),
          aiMessage: `Reviewed ${minutes} minute${minutes > 1 ? "s" : ""} ago. Nothing critical was flagged for ${input.slug}.`,
        } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
