import { useSearchParams, Link } from "react-router-dom";
import { useSearchTools } from "@/hooks/useTools";
import ToolCard from "@/components/ToolCard";
import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [input, setInput] = useState(q);
  const { data: tools, isLoading } = useSearchTools(q);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setSearchParams({ q: input.trim() });
    }
  };

  return (
    <div className="container py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <h1 className="font-heading text-3xl font-bold text-foreground mb-6">
        {q ? `Search results for "${q}"` : "Search Tools"}
      </h1>

      <form onSubmit={handleSearch} className="max-w-xl flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search AI tools..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>
        <button type="submit" className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors">
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : tools && tools.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : q ? (
        <p className="text-muted-foreground text-center py-16">No tools found matching "{q}"</p>
      ) : null}
    </div>
  );
};

export default SearchResultsPage;
