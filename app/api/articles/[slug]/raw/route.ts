import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/sample-data";

interface RouteContext {
  params: { slug: string };
}

export function GET(_request: Request, context: RouteContext) {
  const article = getArticleBySlug(context.params.slug);

  if (!article) {
    return NextResponse.json(
      {
        message: "Article not found"
      },
      { status: 404 }
    );
  }

  return new NextResponse(article.currentVersion.contentMd, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
