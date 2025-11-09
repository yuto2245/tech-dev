import { NextResponse } from "next/server";
import { articles } from "@/lib/sample-data";

export function GET() {
  return NextResponse.json({
    data: articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      trustScore: article.trustScore,
      status: article.status,
      tags: article.tags,
      aiReport: article.currentVersion.aiReport
    }))
  });
}
