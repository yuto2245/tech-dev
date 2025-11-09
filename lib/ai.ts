import OpenAI from "openai";
import { z } from "zod";

const getOpenAiClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

export const aiReportSchema = z.object({
  fact_consistency: z.number().min(0).max(1),
  logical_flow: z.number().min(0).max(1),
  coverage: z.number().min(0).max(1),
  risk_summary: z.string(),
  recommendations: z
    .array(
      z.object({
        severity: z.enum(["low", "medium", "high"]),
        title: z.string(),
        detail: z.string()
      })
    )
    .default([])
});

export type AiCheckResult = z.infer<typeof aiReportSchema>;

const fallback: AiCheckResult = {
  fact_consistency: 0.75,
  logical_flow: 0.78,
  coverage: 0.7,
  risk_summary: "OPENAI_API_KEYが未設定、またはAPIへの接続に失敗したためスタブ応答を返しています。",
  recommendations: [
    {
      severity: "low",
      title: "環境変数の設定",
      detail: "OPENAI_API_KEYを設定すると実際のAIチェックが有効になります。"
    }
  ]
};

export async function runAiConsistencyCheck(input: {
  title: string;
  markdown: string;
}): Promise<AiCheckResult> {
  const client = getOpenAiClient();
  if (!client) {
    return fallback;
  }

  const prompt = `You are an AI reviewer for technical blog posts. Analyse the following Markdown and respond with JSON matching the schema.\n\nTitle: ${input.title}\n\nMarkdown:\n${input.markdown}`;

  try {
    const response = await client.responses.parse({
      model: "gpt-4o-mini",
      input: prompt,
      response_format: aiReportSchema
    });

    const output = (response.output as unknown[])[0] as { content?: Array<{ parsed?: AiCheckResult }> } | undefined;
    const parsed = output?.content?.[0]?.parsed;

    if (!parsed) {
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.error("AI consistency check failed", error);
    return fallback;
  }
}
