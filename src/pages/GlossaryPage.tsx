import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ChevronDown, ChevronUp, BookOpen, Send, X } from "lucide-react";
import { toast } from "sonner";

type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  long_explanation: string | null;
  examples: string | null;
  category: string;
  related_terms: string[] | null;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

const GlossaryPage = () => {
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);

  const { data: terms, isLoading } = useQuery({
    queryKey: ["glossary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary")
        .select("*")
        .eq("is_approved", true)
        .order("term", { ascending: true });
      if (error) throw error;
      return data as GlossaryTerm[];
    },
  });

  const filtered = useMemo(() => {
    if (!terms) return [];
    return terms.filter((t) => {
      const matchesSearch =
        !search ||
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchesLetter =
        !letterFilter || t.term.charAt(0).toUpperCase() === letterFilter;
      const matchesDifficulty =
        difficultyFilter === "All" ||
        t.category === difficultyFilter.toLowerCase();
      return matchesSearch && matchesLetter && matchesDifficulty;
    });
  }, [terms, search, letterFilter, difficultyFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filtered.forEach((t) => {
      const letter = t.term.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(t);
    });
    return groups;
  }, [filtered]);

  const activeLetters = useMemo(() => {
    if (!terms) return new Set<string>();
    return new Set(terms.map((t) => t.term.charAt(0).toUpperCase()));
  }, [terms]);

  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <BookOpen className="mx-auto mb-4 text-accent" size={40} />
        <h1 className="font-heading text-4xl font-bold text-foreground mb-3">
          AI Glossary
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Every AI term explained in plain English. From beginner basics to advanced concepts — searchable, filterable, and always growing.
        </p>

        <div className="max-w-xl mx-auto relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms or definitions..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === d
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setShowSuggest(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors inline-flex items-center gap-1.5"
          >
            <Send size={14} /> Suggest a Term
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          <button
            onClick={() => setLetterFilter(null)}
            className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
              !letterFilter
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const hasTerms = activeLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() =>
                  hasTerms && setLetterFilter(letterFilter === letter ? null : letter)
                }
                disabled={!hasTerms}
                className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                  letterFilter === letter
                    ? "bg-accent text-accent-foreground"
                    : hasTerms
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {terms && (
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Showing {filtered.length} of {terms.length} terms
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-8">
          {Object.keys(grouped)
            .sort()
            .map((letter) => (
              <div key={letter}>
                <h2 className="font-heading text-2xl font-bold text-accent mb-3 border-b border-border pb-2">
                  {letter}
                </h2>
                <div className="space-y-2">
                  {grouped[letter].map((term) => (
                    <TermCard
                      key={term.id}
                      term={term}
                      expanded={expandedId === term.id}
                      onToggle={() => setExpandedId(expandedId === term.id ? null : term.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">No terms found.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setLetterFilter(null);
                  setDifficultyFilter("All");
                }}
                className="text-accent hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {showSuggest && <SuggestTermModal onClose={() => setShowSuggest(false)} />}
    </div>
  );
};

const TermCard = ({
  term,
  expanded,
  onToggle,
}: {
  term: GlossaryTerm;
  expanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-card-foreground">{term.term}</h3>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[term.category] || ""}`}>
            {term.category.charAt(0).toUpperCase() + term.category.slice(1)}
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
        )}
      </button>

      {!expanded && (
        <p className="px-4 pb-4 -mt-1 text-sm text-muted-foreground line-clamp-1">{term.definition}</p>
      )}

      {expanded && (
        <div className="px-4 pb-5 space-y-3 border-t border-border pt-4">
          <p className="text-sm text-foreground font-medium">{term.definition}</p>

          {term.long_explanation && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Detailed Explanation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{term.long_explanation}</p>
            </div>
          )}

          {term.examples && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Examples</h4>
              <p className="text-sm text-muted-foreground">{term.examples}</p>
            </div>
          )}

          {term.related_terms && term.related_terms.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Related Terms</h4>
              <div className="flex flex-wrap gap-1.5">
                {term.related_terms.map((rt) => (
                  <span key={rt} className="px-2.5 py-1 rounded-full text-xs bg-secondary text-secondary-foreground font-medium">
                    {rt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SuggestTermModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ term: "", definition: "", email: "" });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("glossary_suggestions").insert({
        term: form.term,
        definition: form.definition,
        submitter_email: form.email || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you! Your suggestion is under review.");
      onClose();
    },
    onError: () => toast.error("Failed to submit. Please try again."),
  });

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-card-foreground">Suggest a Term</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Term *</label>
            <input required value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className={inputClass} placeholder="e.g. Mixture of Experts" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Definition *</label>
            <textarea required value={form.definition} onChange={(e) => setForm({ ...form, definition: e.target.value })} rows={3} className={inputClass + " resize-none"} placeholder="A brief explanation of the term" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Your Email (optional)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@example.com" />
          </div>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Suggestion"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlossaryPage;
