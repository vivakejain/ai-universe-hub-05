import { useState } from "react";
import { Search } from "lucide-react";
import { glossaryTerms } from "@/data/glossary";

const GlossaryPage = () => {
  const [search, setSearch] = useState("");
  const filtered = glossaryTerms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-10">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">AI Glossary</h1>
      <p className="text-muted-foreground mb-6">AI terms explained in simple, beginner-friendly language.</p>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
        />
      </div>

      <div className="space-y-4">
        {filtered.map(term => (
          <div key={term.term} className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-heading font-semibold text-card-foreground mb-1">{term.term}</h3>
            <p className="text-sm text-muted-foreground">{term.definition}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No terms found matching "{search}"</p>
        )}
      </div>
    </div>
  );
};

export default GlossaryPage;
