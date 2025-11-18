import { invokeLLM } from "../_core/llm";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface AISearchResponse {
  answer: string;
  sources: SearchResult[];
}

/**
 * OpenAI APIを使用してweb検索を実行し、AIが回答と参照サイトを返す
 */
export async function performAISearch(query: string): Promise<AISearchResponse> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that performs web searches and provides comprehensive answers.
When answering questions, you should:
1. Provide a detailed, informative answer
2. Include relevant sources and citations
3. Format your response with clear sections
4. Always cite your sources at the end

For the response, use this JSON format:
{
  "answer": "Your detailed answer here",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://example.com",
      "snippet": "Brief description of the source"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Please search for information about: "${query}" and provide a comprehensive answer with sources.`,
        },
      ],
    });

    // Parse the response
    const messageContent = response.choices[0].message.content;
    if (!messageContent) {
      throw new Error("No response from LLM");
    }
    const content = typeof messageContent === "string" ? messageContent : messageContent.map(c => (c as any).text || "").join("");

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // If no JSON found, create a structured response from the text
      return {
        answer: content,
        sources: [],
      };
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return {
      answer: parsedResponse.answer || content,
      sources: parsedResponse.sources || [],
    };
  } catch (error) {
    console.error("[AI Search] Error:", error);
    throw error;
  }
}

/**
 * URLからHTMLをスクレイピングして取得
 */
export async function scrapeWebPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error("[Web Scraping] Error:", error);
    throw error;
  }
}

/**
 * HTMLをMarkdownに変換
 */
export async function convertHTMLToMarkdown(html: string): Promise<string> {
  try {
    // Use LLM to convert HTML to Markdown
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert at converting HTML to clean, well-formatted Markdown.
Convert the provided HTML to Markdown format following these rules:
1. Remove navigation, headers, footers, and ads
2. Keep only the main content
3. Preserve code blocks with proper syntax highlighting
4. Convert links to Markdown format [text](url)
5. Preserve headings, lists, and formatting
6. Remove unnecessary whitespace
7. Output ONLY the Markdown content, no explanations`,
        },
        {
          role: "user",
          content: `Convert this HTML to Markdown:\n\n${html}`,
        },
      ],
    });

    const messageContent = response.choices[0].message.content;
    if (!messageContent) {
      throw new Error("Failed to convert HTML to Markdown");
    }
    const markdown = typeof messageContent === "string" ? messageContent : messageContent.map(c => (c as any).text || "").join("");
    return markdown;
  } catch (error) {
    console.error("[HTML to Markdown] Error:", error);
    throw error;
  }
}
