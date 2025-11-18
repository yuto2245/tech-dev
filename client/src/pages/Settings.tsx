import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { Moon, Sun, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const FONT_OPTIONS = [
  { value: "openai-sans", label: "OpenAI Sans" },
  { value: "anthropic-serif", label: "Anthropic Serif" },
  { value: "source-serif-4", label: "Source Serif 4" },
];

export default function Settings() {
  const { user, loading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { data: settings } = trpc.user.getSettings.useQuery();
  const utils = trpc.useUtils();
  const updateSettingsMutation = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      utils.user.getSettings.invalidate();
    },
  });
  const [selectedFont, setSelectedFont] = useState(settings?.blogFont || "openai-sans");
  const { data: repositories = [] } = trpc.user.getRepositories.useQuery();
  const addRepositoryMutation = trpc.user.addRepository.useMutation();
  const deleteRepositoryMutation = trpc.user.deleteRepository.useMutation();
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [contentDir, setContentDir] = useState("articles");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access settings</p>
      </div>
    );
  }

  const handleFontChange = async (fontValue: string) => {
    setSelectedFont(fontValue);
    try {
      await updateSettingsMutation.mutateAsync({ blogFont: fontValue });
      toast.success("Font setting updated");
      // Invalidate cache to force refetch
      await utils.user.getSettings.invalidate();
    } catch (error) {
      toast.error("Failed to update font setting");
      setSelectedFont(settings?.blogFont || "openai-sans");
    }
  };

  const getFontFamily = (fontValue: string) => {
    if (fontValue === "anthropic-serif") return "Georgia, 'Times New Roman', serif";
    if (fontValue === "source-serif-4") return "'Source Serif 4', Georgia, 'Times New Roman', serif";
    return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          <nav className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              {user?.name?.charAt(0).toUpperCase()}
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Settings</h2>
          <p className="text-muted-foreground">Customize your experience</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Font Selection</CardTitle>
            <CardDescription>
              Choose your preferred font for blog titles and buttons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {FONT_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleFontChange(option.value)}
                >
                  <input
                    type="radio"
                    name="font"
                    value={option.value}
                    checked={selectedFont === option.value}
                    onChange={() => handleFontChange(option.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <label className="font-semibold cursor-pointer block">
                      {option.label}
                    </label>
                    <div
                      className="text-sm text-muted-foreground mt-2"
                      style={{ fontFamily: getFontFamily(option.value) }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>GitHub Repositories</CardTitle>
            <CardDescription>
              Add repositories to fetch articles from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Repository Owner</label>
                  <Input
                    placeholder="GitHub username or organization"
                    value={repoOwner}
                    onChange={(e) => setRepoOwner(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Repository Name</label>
                  <Input
                    placeholder="Repository name"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content Directory</label>
                  <Input
                    placeholder="articles"
                    value={contentDir}
                    onChange={(e) => setContentDir(e.target.value)}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!repoOwner || !repoName) {
                      toast.error("Please fill in all fields");
                      return;
                    }
                    try {
                      await addRepositoryMutation.mutateAsync({
                        owner: repoOwner,
                        repo: repoName,
                        contentDir: contentDir || "articles",
                      });
                      toast.success("Repository added");
                      setRepoOwner("");
                      setRepoName("");
                      setContentDir("articles");
                    } catch (error) {
                      toast.error("Failed to add repository");
                    }
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Repository
                </Button>
              </div>

              {repositories && repositories.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Added Repositories</h3>
                  {repositories.map((repo: any) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{repo.owner}/{repo.repo}</p>
                        <p className="text-sm text-muted-foreground">{repo.contentDir}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await deleteRepositoryMutation.mutateAsync({ id: repo.id });
                            toast.success("Repository removed");
                          } catch (error) {
                            toast.error("Failed to remove repository");
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Current theme: {theme === 'light' ? 'Light' : 'Dark'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Switch to Dark Mode
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Switch to Light Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border py-6 text-center text-muted-foreground">
        <p>© 2025 {APP_TITLE}. All rights reserved.</p>
      </footer>
    </div>
  );
}
