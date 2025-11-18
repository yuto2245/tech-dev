import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai-elements/code-block";
import { LinkCard } from "./LinkCard";

function parseLinkCardBlock(raw: string) {
  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...rest] = line.split(":");
      if (!key) return acc;
      acc[key.trim().toLowerCase()] = rest.join(":").trim();
      return acc;
    }, {});
}

type MarkdownRendererProps = {
  content: string;
};

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const language = match?.[1];
    const raw = String(children ?? "");

    if (language === "link-card") {
      const data = parseLinkCardBlock(raw);
      return (
        <LinkCard
          url={data.url}
          title={data.title}
          description={data.description}
          site={data.site}
          image={data.image}
        />
      );
    }

    if (language) {
      return (
        <CodeBlock code={raw} language={language}>
          <CodeBlockCopyButton />
        </CodeBlock>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  a({ children, ...props }) {
    return (
      <a {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
