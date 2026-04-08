import { useState } from "react";
import { categories } from "@/data/categories";
import { CheckCircle } from "lucide-react";

const SubmitToolPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const mainCategories = categories.filter(c => !["community-submissions", "ai-glossary", "ai-news"].includes(c.slug));

  if (submitted) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <h1 className="font-heading text-2xl font-bold mb-2">Thank you!</h1>
        <p className="text-muted-foreground">Your submission is pending review. We'll add it once approved.</p>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Submit a Tool</h1>
      <p className="text-muted-foreground mb-8">Know an AI tool the community should know about? Submit it here and we'll review it.</p>

      <form
        onSubmit={e => { e.preventDefault(); setSubmitted(true); }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tool Name *</label>
          <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="e.g. ChatGPT" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Website URL *</label>
          <input required type="url" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="https://example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
          <select required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm">
            <option value="">Select a category</option>
            {mainCategories.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Short Description *</label>
          <textarea required rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none" placeholder="What does this tool do? (2-3 sentences)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Your Email *</label>
          <input required type="email" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="you@example.com" />
        </div>
        <button type="submit" className="w-full px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors">
          Submit Tool for Review
        </button>
      </form>
    </div>
  );
};

export default SubmitToolPage;
