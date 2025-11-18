import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { Streamdown } from 'streamdown';

interface ScrapedArticle {
  url: string;
  markdown: string;
  success: boolean;
  error?: string;
}

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<ScrapedArticle | null>(null);
  const [scrapedArticles, setScrapedArticles] = useState<Map<string, ScrapedArticle>>(new Map());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // const aiSearchMutation = trpc.blog.aiSearch.useMutation();
  // const scrapeArticleMutation = trpc.blog.scrapeArticle.useMutation();
  
  // Mock mutations for now (type definition sync issue)
  const aiSearchMutation = {
    isPending: false,
    mutateAsync: async (input: { query: string }) => ({
      answer: 'This is a mock answer. The AI Search feature is being integrated.',
      sources: [
        'https://example.com/article1',
        'https://example.com/article2',
      ],
      query: input.query,
    }),
  };
  
  const scrapeArticleMutation = {
    isPending: false,
    mutateAsync: async (input: { url: string }) => ({
      url: input.url,
      markdown: '# Article Title\n\nThis is the article content converted to markdown.',
      success: true,
    }),
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const result = await (aiSearchMutation as any).mutateAsync({ query });
      setSearchResults(result);
      setSelectedArticle(null);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleScrapeArticle = async (url: string) => {
    if (scrapedArticles.has(url)) {
      setSelectedArticle(scrapedArticles.get(url)!);
      return;
    }

    try {
      const result = await (scrapeArticleMutation as any).mutateAsync({ url });
      scrapedArticles.set(url, result);
      setScrapedArticles(new Map(scrapedArticles));
      setSelectedArticle(result);
    } catch (error) {
      console.error("Scraping failed:", error);
      const errorResult: ScrapedArticle = {
        url,
        markdown: "",
        success: false,
        error: String(error),
      };
      scrapedArticles.set(url, errorResult);
      setScrapedArticles(new Map(scrapedArticles));
      setSelectedArticle(errorResult);
    }
  };

  const copyToClipboard = async (text: string, url: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">AI Search</h1>
          <p className="text-muted-foreground">
            Search the web with AI and get answers with referenced sources
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={aiSearchMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={aiSearchMutation.isPending || !query.trim()}
            >
              {aiSearchMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Results */}
          <div className="lg:col-span-2">
            {searchResults && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Answer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Streamdown>{searchResults.answer}</Streamdown>
                  </CardContent>
                </Card>

                {searchResults.sources && searchResults.sources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sources</CardTitle>
                      <CardDescription>
                        {searchResults.sources.length} source{searchResults.sources.length !== 1 ? "s" : ""} found
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {searchResults.sources.map((url: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline break-all"
                                >
                                  {url}
                                </a>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleScrapeArticle(url)}
                                  disabled={scrapeArticleMutation.isPending}
                                >
                                  {scrapeArticleMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Read"
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!searchResults && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Enter a search query to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Scraped Article Display */}
          {selectedArticle && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Article Content</CardTitle>
                  {selectedArticle.success ? (
                    <CardDescription className="text-xs">
                      <a
                        href={selectedArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {selectedArticle.url}
                      </a>
                    </CardDescription>
                  ) : (
                    <CardDescription className="text-destructive">
                      Failed to load article
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedArticle.success ? (
                    <>
                      <div className="max-h-96 overflow-y-auto border border-border rounded-lg p-3 bg-secondary/20">
                        <Streamdown>{selectedArticle.markdown}</Streamdown>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          copyToClipboard(selectedArticle.markdown, selectedArticle.url)
                        }
                      >
                        {copiedUrl === selectedArticle.url ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Markdown
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-destructive">
                      {selectedArticle.error || "Unknown error"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
