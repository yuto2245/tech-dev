import { codeToHtml } from "shiki/bundle/web";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "ts",
  tsx: "tsx",
  sh: "shell",
  bash: "bash",
  shell: "shell",
  yml: "yaml",
  md: "markdown",
  py: "python",
};

const CodeBlockContext = createContext<{ code: string } | null>(null);

function normalizeLanguage(lang?: string) {
  if (!lang) return "ts";
  const lower = lang.toLowerCase();
  return LANGUAGE_ALIASES[lower] ?? lower;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  children?: ReactNode;
  className?: string;
};

export function CodeBlock({
  code,
  language,
  showLineNumbers = true,
  children,
  className,
}: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const lines = useMemo(() => {
    const trimmed = code.endsWith("\n") ? code : `${code}\n`;
    return trimmed.split("\n").slice(0, -1);
  }, [code]);

  useEffect(() => {
    let canceled = false;

    const run = async () => {
      const lang = normalizeLanguage(language);
      try {
        const html = await codeToHtml(code, {
          lang,
          themes: {
            light: "github-light-default",
            dark: "github-dark-default",
          },
        });
        if (!canceled) {
          setHighlighted(html);
        }
      } catch (err) {
        if (!canceled) {
          console.warn("[CodeBlock] Falling back to plain text", err);
          setHighlighted(`<pre><code>${escapeHtml(code)}</code></pre>`);
        }
      }
    };

    run();

    return () => {
      canceled = true;
    };
  }, [code, language]);

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        className={cn(
          "code-block relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-white to-slate-50 shadow-sm dark:border-white/10 dark:from-slate-950 dark:to-slate-900",
          className
        )}
      >
        {showLineNumbers && (
          <div className="code-block__line-numbers" aria-hidden>
            {lines.map((_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
        )}
        <div className="code-block__content" dangerouslySetInnerHTML={{ __html: highlighted ?? `<pre><code>${escapeHtml(code)}</code></pre>` }} />
        <div className="code-block__toolbar">
          {children ?? <CodeBlockCopyButton />}
        </div>
      </div>
    </CodeBlockContext.Provider>
  );
}

type CopyButtonProps = {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  className?: string;
};

export function CodeBlockCopyButton({ onCopy, onError, timeout = 2000, className }: CopyButtonProps) {
  const context = useContext(CodeBlockContext);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!context?.code) return;
    try {
      await navigator.clipboard.writeText(context.code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), timeout);
    } catch (err) {
      setCopied(false);
      if (err instanceof Error) {
        onError?.(err);
      }
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "rounded-full border border-white/50 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-black/60 dark:border-white/10",
        className
      )}
      onClick={handleCopy}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
