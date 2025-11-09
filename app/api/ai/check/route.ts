import { NextResponse } from "next/server";
import { z } from "zod";
import { aiReportSchema, runAiConsistencyCheck } from "@/lib/ai";

const requestSchema = z.object({
  title: z.string().min(3),
  markdown: z.string().min(10)
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid payload",
        errors: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const aiResult = await runAiConsistencyCheck(parsed.data);
  const validated = aiReportSchema.parse(aiResult);

  return NextResponse.json({
    data: {
      ...validated,
      trust_score: Number(((validated.fact_consistency + validated.logical_flow + validated.coverage) / 3).toFixed(2))
    }
  });
}
