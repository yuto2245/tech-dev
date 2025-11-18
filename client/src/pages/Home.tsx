import { useLocation } from "wouter";
import Header from "@/components/Header";
import { APP_TITLE } from "@/const";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: userSettings } = trpc.user.getSettings.useQuery();
  const [blogFont, setBlogFont] = useState<"openai-sans" | "anthropic-serif" | "source-serif-4">("openai-sans");

  useEffect(() => {
    if (userSettings?.blogFont) {
      setBlogFont(userSettings.blogFont as "openai-sans" | "anthropic-serif" | "source-serif-4");
    }
  }, [userSettings]);

  const getFontFamily = () => {
    switch (blogFont) {
      case "anthropic-serif":
        return "Georgia, 'Times New Roman', serif";
      case "source-serif-4":
        return "'Source Serif 4', Georgia, 'Times New Roman', serif";
      default:
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  };

  const handleReadBlog = () => {
    navigate("/blog");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full flex flex-col items-center">
          {/* タイトル - 洗練されたデザイン */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight" style={{ fontFamily: getFontFamily() }}>
              {APP_TITLE}
            </h1>

          </div>

          {/* Read Blog ボタン */}
          <button
            onClick={handleReadBlog}
            className="px-8 py-3 bg-foreground text-background font-semibold rounded-full hover:opacity-90 transition-opacity duration-200 text-base md:text-lg"
            style={{ fontFamily: getFontFamily() }}
          >
            Read Blog
          </button>
        </div>
      </main>
    </div>
  );
}
