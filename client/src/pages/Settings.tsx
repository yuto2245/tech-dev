import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { usePreferences, getBlogFontFamily, type BlogFont } from "@/contexts/PreferencesContext";
import { toast } from "sonner";
import { Check, Moon, Sun } from "lucide-react";

const FONT_OPTIONS: { value: BlogFont; label: string; example: string }[] = [
  { value: "openai-sans", label: "OpenAI Sans", example: "system sans-serif" },
  { value: "anthropic-serif", label: "Anthropic Serif", example: "Georgia" },
  { value: "source-serif-4", label: "Source Serif 4", example: "Source Serif" },
];

const OPERATIONS_GUIDE = [
  {
    title: "GitHub に push するだけで公開",
    description:
      "GITHUB_OWNER / GITHUB_REPO / GITHUB_CONTENT_DIR を .env に設定すると、サーバーが GitHub API から Markdown を読み込みます。",
    items: [
      "記事を Markdown で作成し、指定ディレクトリに配置",
      "main などの公開ブランチへ push",
      "数分後に一覧と詳細画面へ自動反映 (キャッシュ 5 分)",
    ],
  },
  {
    title: "カードリンクの記法",
    description:
      "コードフェンスに link-card を指定し、url / title / description / image を書くだけでリッチカード化されます。",
    items: [
      "``````link-card で始め、key: value を 1 行ずつ記述",
      "url は必須。title / description / site / image は任意",
      "MarkdownRenderer が LinkCard コンポーネントに変換",
    ],
  },
  {
    title: "コードブロックの使い方",
    description:
      "```ts や ```bash など言語を指定すると Shiki ベースの CodeBlock が行番号とコピー機能付きで描画されます。",
    items: [
      "コピーは右上のボタンから 1 クリック",
      "ダーク/ライトテーマに自動追随",
      "インラインコードは従来通りバッククォートでOK",
    ],
  },
];

const DEPLOY_TIPS = [
  "フロントエンドは pnpm run build で生成される dist/public を GitHub Pages に配置可能",
  "サーバー(API)は Node.js (例えば Render, Fly.io, AWS) など常時稼働する環境が必要",
  "GitHub Pages + 外部の Node サービスという二段構成が最も簡単な運用パターン",
];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { blogFont, setBlogFont } = usePreferences();

  const handleFontChange = (font: BlogFont) => {
    setBlogFont(font);
    toast.success("Font preference saved locally");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
        <section>
          <h1 className="text-3xl font-bold">Reader preferences</h1>
          <p className="text-sm text-muted-foreground">変更はローカルストレージに保存され、即時にブログへ反映されます。</p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>本文フォント</CardTitle>
            <CardDescription>ブログの本文と見出しに適用されます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FONT_OPTIONS.map(option => (
              <button
                key={option.value}
                className="flex w-full items-center justify-between rounded-2xl border border-border/80 p-4 text-left hover:border-primary/40"
                onClick={() => handleFontChange(option.value)}
              >
                <div>
                  <p className="font-semibold" style={{ fontFamily: getBlogFontFamily(option.value) }}>
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{option.example}</p>
                </div>
                {blogFont === option.value && (
                  <span className="rounded-full bg-primary/10 p-2 text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>テーマ</CardTitle>
            <CardDescription>UI 全体のライト/ダークを切り替えます。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={toggleTheme} className="flex items-center gap-2">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Switch to {theme === "light" ? "dark" : "light"} mode
            </Button>
          </CardContent>
        </Card>

        <section className="grid gap-6 md:grid-cols-2">
          {OPERATIONS_GUIDE.map(guide => (
            <Card key={guide.title}>
              <CardHeader>
                <CardTitle>{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {guide.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>GitHub デプロイについて</CardTitle>
            <CardDescription>フロントとバックエンドでホスティング戦略が異なります。</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {DEPLOY_TIPS.map(tip => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">
              <p className="font-semibold">必要な環境変数</p>
              <p>GITHUB_OWNER / GITHUB_REPO / GITHUB_BRANCH / GITHUB_CONTENT_DIR / (任意) GITHUB_TOKEN</p>
              <p className="mt-2">Node サーバーは Render などのホスティングへデプロイし、GitHub Pages には dist/public を配置すると構成がシンプルです。</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
