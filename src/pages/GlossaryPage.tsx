import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import DataErrorBanner from "@/components/DataErrorBanner";
import { Search, ChevronDown, BookOpen, Send, X, Copy, Sparkles, Shuffle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { glossaryTerms as builtInGlossaryTerms } from "@/data/glossary";

type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  category: string | null;
  example?: string | null;
  examples?: string | null;
  long_explanation?: string | null;
  related_terms: string[] | null;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;

const LEARNING_TRACKS = [
  {
    title: "Start Here",
    level: "Beginner",
    terms: ["Prompt", "Token", "Hallucination"],
  },
  {
    title: "Builder Track",
    level: "Intermediate",
    terms: ["Retrieval-Augmented Generation (RAG)", "Function Calling", "Prompt Injection"],
  },
  {
    title: "Power User",
    level: "Advanced",
    terms: ["LoRA", "Mixture of Experts (MoE)", "Reinforcement Learning from Human Feedback (RLHF)"],
  },
] as const;

const difficultyColors: Record<string, string> = {
  beginner: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  intermediate: "border border-sky-200 bg-sky-50 text-sky-700",
  advanced: "border border-amber-200 bg-amber-50 text-amber-700",
};

function normalizeDifficulty(raw: string | null | undefined) {
  return (raw || "beginner").toLowerCase();
}

function termExample(t: GlossaryTerm) {
  return t.example?.trim() || t.examples?.trim() || null;
}

function deriveDetailedExplanation(term: GlossaryTerm) {
  if (term.long_explanation?.trim()) return term.long_explanation.trim();

  const level = normalizeDifficulty(term.category);
  const lens =
    level === "advanced"
      ? "In advanced workflows,"
      : level === "intermediate"
      ? "In practical systems,"
      : "At a high level,";

  return `${lens} ${term.definition} This concept becomes useful when evaluating real tool behavior, prompts, and model quality in production contexts.`;
}

function deriveExampleText(term: GlossaryTerm) {
  const explicit = termExample(term);
  if (explicit) return explicit;
  return `Example: In an AI product review, you can use "${term.term}" to explain why a model output quality improved or degraded.`;
}

function glossaryKey(term: string) {
  return term.trim().toLowerCase();
}

const GlossaryPage = () => {
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [spotlightTermId, setSpotlightTermId] = useState<string | null>(null);

  const {
    data: dbTerms,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["glossary"],
    queryFn: async () => {
      const { data, error: qError } = await supabase
        .from("glossary")
        .select("*")
        .eq("is_approved", true)
        .order("term", { ascending: true });
      if (qError) throw qError;
      return data as GlossaryTerm[];
    },
  });

  const terms = useMemo(() => {
    const byKey = new Map<string, GlossaryTerm>();

    for (const term of builtInGlossaryTerms) {
      const key = glossaryKey(term.term);
      byKey.set(key, {
        id: `seed-${key.replace(/[^a-z0-9]+/g, "-")}`,
        term: term.term,
        definition: term.definition,
        category: term.category ?? "Beginner",
        examples: null,
        long_explanation: null,
        related_terms: null,
      });
    }

    for (const term of dbTerms ?? []) {
      const key = glossaryKey(term.term);
      byKey.set(key, term);
    }

    return Array.from(byKey.values()).sort((a, b) => a.term.localeCompare(b.term));
  }, [dbTerms]);

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
        normalizeDifficulty(t.category) === difficultyFilter.toLowerCase();
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

  const termStats = useMemo(() => {
    const stats = {
      total: terms.length,
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };

    for (const term of terms) {
      const level = normalizeDifficulty(term.category);
      if (level === "advanced") stats.advanced += 1;
      else if (level === "intermediate") stats.intermediate += 1;
      else stats.beginner += 1;
    }

    return stats;
  }, [terms]);

  const resetGlossaryView = () => {
    setSearch("");
    setLetterFilter(null);
    setExpandedId(null);
  };

  const spotlightTerm = useMemo(
    () => terms.find((term) => term.id === spotlightTermId) ?? null,
    [terms, spotlightTermId],
  );

  const handleTermJump = (rawTerm: string) => {
    const found = terms.find((t) => glossaryKey(t.term) === glossaryKey(rawTerm));
    if (!found) return;
    setSearch(found.term);
    setLetterFilter(found.term.charAt(0).toUpperCase());
    setExpandedId(found.id);
  };

  const chooseRandomSpotlight = () => {
    if (terms.length === 0) return;
    const candidates = terms.filter((term) => term.id !== spotlightTermId);
    const pool = candidates.length > 0 ? candidates : terms;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setSpotlightTermId(random.id);
    setExpandedId(random.id);
    setLetterFilter(random.term.charAt(0).toUpperCase());
    setSearch(random.term);
  };

  useEffect(() => {
    if (!spotlightTermId && terms.length > 0) {
      setSpotlightTermId(terms[Math.floor(Math.random() * terms.length)].id);
    }
  }, [terms, spotlightTermId]);

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
            onClick={resetGlossaryView}
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

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Total", value: termStats.total },
            { label: "Beginner", value: termStats.beginner },
            { label: "Intermediate", value: termStats.intermediate },
            { label: "Advanced", value: termStats.advanced },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card px-3 py-2 text-left">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="font-heading text-lg font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        {spotlightTerm && (
          <div className="mt-6 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 via-background to-secondary/40 p-4 text-left shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-accent">
                  <Lightbulb size={12} /> Spotlight Term
                </p>
                <h3 className="font-heading mt-1 text-xl font-bold text-foreground">{spotlightTerm.term}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{spotlightTerm.definition}</p>
              </div>
              <button
                type="button"
                onClick={chooseRandomSpotlight}
                className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent/10"
              >
                <Shuffle size={13} /> Surprise me
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleTermJump(spotlightTerm.term)}
              className="mt-3 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Open this term
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-2 text-left sm:grid-cols-3">
          {LEARNING_TRACKS.map((track) => (
            <div key={track.title} className="rounded-xl border border-border bg-card p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{track.level}</p>
              <h4 className="font-heading text-base font-semibold text-card-foreground">{track.title}</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {track.terms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleTermJump(term)}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent/20"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {terms && !isError && (
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Showing {filtered.length} of {terms.length} terms
        </p>
      )}

      {isError && (
        <DataErrorBanner message={error instanceof Error ? error.message : undefined} />
      )}

      {isLoading && <LoadingSpinner />}

      {!isLoading && !isError && (
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
                      onRelatedClick={(value) => {
                        setSearch(value);
                        setLetterFilter(value.charAt(0).toUpperCase());
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">No terms found.</p>
              <button
                onClick={() => {
                  resetGlossaryView();
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
  onRelatedClick,
}: {
  term: GlossaryTerm;
  expanded: boolean;
  onToggle: () => void;
  onRelatedClick: (value: string) => void;
}) => {
  const level = normalizeDifficulty(term.category);
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);
  const detailedExplanation = deriveDetailedExplanation(term);
  const exampleText = deriveExampleText(term);

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-[1px] hover:border-accent/30 hover:shadow-[0_8px_22px_rgba(11,40,64,0.08)]">
      <button
        onClick={onToggle}
        className="group w-full bg-card px-4 py-4 text-left transition-colors hover:bg-accent/5 focus-visible:bg-accent/10"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h3 className="font-heading font-semibold text-card-foreground">{term.term}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[level] || "border border-border bg-secondary text-secondary-foreground"}`}>
            {levelLabel}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {!expanded && (
        <p className="px-4 pb-4 text-sm text-muted-foreground/90 line-clamp-1">{term.definition}</p>
      )}

      {expanded && (
        <div className="animate-in fade-in-0 slide-in-from-top-1 space-y-3 border-t border-border/80 px-4 pb-5 pt-4 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background/70 px-3 py-2">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles size={12} /> Quick context ready for practical use
            </p>
            <button
              type="button"
              onClick={() => {
                const payload = `${term.term}\n\nDefinition: ${term.definition}\n\nMore detail: ${detailedExplanation}`;
                navigator.clipboard.writeText(payload).then(
                  () => toast.success(`Copied ${term.term} notes.`),
                  () => toast.error("Could not copy notes."),
                );
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              <Copy size={12} /> Copy
            </button>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Definition</h4>
            <p className="text-sm text-foreground leading-relaxed">{term.definition}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Example</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{exampleText}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">More detail</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{detailedExplanation}</p>
          </div>

          {term.related_terms && term.related_terms.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Related Terms</h4>
              <div className="flex flex-wrap gap-1.5">
                {term.related_terms.map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => onRelatedClick(rt)}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent/20"
                  >
                    {rt}
                  </button>
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
