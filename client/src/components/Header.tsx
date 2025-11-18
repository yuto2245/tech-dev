import { Link, useLocation } from "wouter";
import { APP_TITLE } from "@/const";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/contexts/PreferencesContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/ai-search", label: "AI Search" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const [location] = useLocation();
  const { blogFont } = usePreferences();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span role="img" aria-hidden className="text-2xl">
            📝
          </span>
          <span className="tracking-tight" style={{ fontFamily: blogFont }}>
            {APP_TITLE}
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                location === link.href
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
