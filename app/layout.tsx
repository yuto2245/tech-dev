import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TechDev | 信頼できる技術知識のためのAIパブリッシング",
    template: "%s | TechDev"
  },
  description:
    "TechDevは、GitHub連携とAIファクトチェックで技術記事の信頼性を高めるパブリッシングプラットフォームです。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col bg-slate-50`}>
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary-600">
              TechDev
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <Link href="/articles" className="transition hover:text-primary-600">
                記事一覧
              </Link>
              <Link href="/dashboard" className="transition hover:text-primary-600">
                信頼性ダッシュボード
              </Link>
              <Link href="/docs" className="transition hover:text-primary-600">
                ドキュメント
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white/90">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} TechDev Platform</p>
            <div className="flex gap-3">
              <Link href="/privacy" className="hover:text-primary-600">
                プライバシー
              </Link>
              <Link href="/terms" className="hover:text-primary-600">
                利用規約
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary-600"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
