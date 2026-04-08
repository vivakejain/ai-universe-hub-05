import { useState } from "react";
import { categories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const SubmitToolPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const mainCategories = categories.filter(c => !["community-submissions", "ai-glossary", "ai-news"].includes(c.slug));

  const [form, setForm] = useState({
    name: "",
    url: "",
    category: "",
    description: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Extract domain from URL
    let domain = "";
    try {
      domain = new URL(form.url).hostname.replace("www.", "");
    } catch {
      domain = form.url;
    }

    const { error } = await supabase.from("tools").insert({
      name: form.name,
      domain,
      description: form.description,
      category: form.category,
      is_approved: false,
      is_community_submitted: true,
      submitter_email: form.email,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to submit. Please try again.");
      console.error(error);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <h1 className="font-heading text-2xl font-bold mb-2">Thank you!</h1>
        <p className="text-muted-foreground">Your submission is pending review. We'll add it once approved.</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm";

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Submit a Tool</h1>
      <p className="text-muted-foreground mb-8">Know an AI tool the community should know about? Submit it here and we'll review it.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tool Name *</label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} type="text" className={inputClass} placeholder="e.g. ChatGPT" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Website URL *</label>
          <input required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} type="url" className={inputClass} placeholder="https://example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
          <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
            <option value="">Select a category</option>
            {mainCategories.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Short Description *</label>
          <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass + " resize-none"} placeholder="What does this tool do? (2-3 sentences)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Your Email *</label>
          <input required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className={inputClass} placeholder="you@example.com" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Tool for Review"}
        </button>
      </form>
    </div>
  );
};

export default SubmitToolPage;
