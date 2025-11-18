import { useLocation } from "wouter";
import Header from "@/components/Header";
import { APP_TITLE } from "@/const";
import { usePreferences, getBlogFontFamily } from "@/contexts/PreferencesContext";

export default function Home() {
  const [, navigate] = useLocation();
  const { blogFont } = usePreferences();

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
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight"
              style={{ fontFamily: getBlogFontFamily(blogFont) }}
            >
              {APP_TITLE}
            </h1>

          </div>

          {/* Read Blog ボタン */}
          <button
            onClick={handleReadBlog}
            className="px-8 py-3 bg-foreground text-background font-semibold rounded-full hover:opacity-90 transition-opacity duration-200 text-base md:text-lg"
            style={{ fontFamily: getBlogFontFamily(blogFont) }}
          >
            Read Blog
          </button>
        </div>
      </main>
    </div>
  );
}
