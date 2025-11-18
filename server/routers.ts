import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  getUserRepositories, 
  addUserRepository, 
  removeUserRepository, 
  getAllActiveUserRepositories,
  getUserSettings,
  updateUserSettings 
} from "./db";
import { fetchGithubArticles } from "./_core/github";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  blog: router({
    listAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        const userRepos = await getUserRepositories(ctx.user.id);
        const allArticles: any[] = [];

        for (const repo of userRepos) {
          const articles = await fetchGithubArticles(repo.owner, repo.name, repo.contentDir);
          allArticles.push(...articles);
        }

        // Sort by date descending
        allArticles.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0).getTime();
          const dateB = new Date(b.date || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        return allArticles;
      } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
      }
    }),

    get: publicProcedure
      .input(z.object({ 
        owner: z.string(),
        repo: z.string(),
        path: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${input.owner}/${input.repo}/contents/${input.path}`,
            {
              headers: {
                "Authorization": `token ${process.env.GITHUB_TOKEN}`,
              },
            }
          );
          if (!response.ok) return null;
          const data = await response.json();
          if (data.type !== "file") return null;
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          return {
            content,
            path: data.path,
            name: data.name,
          };
        } catch (error) {
          console.error("Error fetching article:", error);
          return null;
        }
      }),
  }),

  user: router({
    getRepositories: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRepositories(ctx.user.id);
    }),

    addRepository: protectedProcedure
      .input(z.object({
        owner: z.string(),
        name: z.string(),
        contentDir: z.string().default("articles"),
      }))
      .mutation(async ({ ctx, input }) => {
        return await addUserRepository(ctx.user.id, input.owner, input.name, input.contentDir);
      }),

    deleteRepository: protectedProcedure
      .input(z.object({
        owner: z.string(),
        name: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await removeUserRepository(ctx.user.id, input.owner, input.name);
      }),

    getSettings: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSettings(ctx.user.id);
    }),

    updateSettings: protectedProcedure
      .input(z.object({
        blogFont: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateUserSettings(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
