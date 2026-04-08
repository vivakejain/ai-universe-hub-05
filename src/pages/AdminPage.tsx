import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { categories } from "@/data/categories";
import { CheckCircle, XCircle, Pencil, Trash2, Plus, LogOut, BarChart3, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import type { DbTool } from "@/hooks/useTools";

const ADMIN_PASSWORD = "admin360"; // Simple password protection

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "tools" | "pending" | "add">("stats");
  const queryClient = useQueryClient();

  const mainCategories = categories.filter(
    (c) => !["community-submissions", "ai-glossary", "ai-news"].includes(c.slug)
  );

  // Check stored auth
  useEffect(() => {
    if (sessionStorage.getItem("ea360_admin") === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem("ea360_admin", "true");
    } else {
      toast.error("Invalid password");
    }
  };

  if (!authenticated) {
    return (
      <div className="container py-20 max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8">
          <Shield className="mx-auto mb-4 text-accent" size={40} />
          <h1 className="font-heading text-2xl font-bold text-center mb-6">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            />
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("ea360_admin");
            setAuthenticated(false);
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border">
        {([
          { key: "stats", label: "Dashboard", icon: BarChart3 },
          { key: "tools", label: "All Tools", icon: CheckCircle },
          { key: "pending", label: "Pending", icon: Clock },
          { key: "add", label: "Add Tool", icon: Plus },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {activeTab === "stats" && <StatsPanel />}
      {activeTab === "tools" && <ToolsList />}
      {activeTab === "pending" && <PendingList />}
      {activeTab === "add" && <AddToolForm categories={mainCategories} />}
    </div>
  );
};

// ---- Stats Panel ----
const StatsPanel = () => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin", "all-tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*");
      if (error) throw error;
      return data as DbTool[];
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading stats...</div>;

  const total = tools?.length || 0;
  const approved = tools?.filter((t) => t.is_approved).length || 0;
  const pending = tools?.filter((t) => !t.is_approved).length || 0;
  const community = tools?.filter((t) => t.is_community_submitted).length || 0;

  const stats = [
    { label: "Total Tools", value: total, color: "text-accent" },
    { label: "Approved", value: approved, color: "text-green-500" },
    { label: "Pending", value: pending, color: "text-amber-500" },
    { label: "Community Submitted", value: community, color: "text-blue-500" },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
          <p className={`text-3xl font-bold font-heading ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};

// ---- Tools List ----
const ToolsList = () => {
  const queryClient = useQueryClient();
  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin", "all-tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbTool[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast.success("Tool deleted");
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading tools...</div>;

  return (
    <div className="space-y-3">
      {tools?.map((tool) => (
        <div key={tool.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-semibold text-card-foreground truncate">{tool.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${tool.is_approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {tool.is_approved ? "Approved" : "Pending"}
              </span>
              {tool.is_community_submitted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Community</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
          </div>
          <button
            onClick={() => {
              if (confirm("Delete this tool?")) deleteMutation.mutate(tool.id);
            }}
            className="text-destructive hover:text-destructive/80 p-2"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {(!tools || tools.length === 0) && (
        <p className="text-muted-foreground text-center py-8">No tools yet.</p>
      )}
    </div>
  );
};

// ---- Pending List ----
const PendingList = () => {
  const queryClient = useQueryClient();
  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin", "all-tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbTool[];
    },
  });

  const pending = tools?.filter((t) => !t.is_approved) || [];

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools").update({ is_approved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast.success("Tool approved!");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast.success("Submission rejected");
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-3">
      {pending.map((tool) => (
        <div key={tool.id} className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-card-foreground">{tool.name}</h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              {tool.domain && (
                <p className="text-xs text-accent mt-1">{tool.domain}</p>
              )}
              {tool.submitter_email && (
                <p className="text-xs text-muted-foreground mt-1">Submitted by: {tool.submitter_email}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => approveMutation.mutate(tool.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-colors"
              >
                <CheckCircle size={14} /> Approve
              </button>
              <button
                onClick={() => {
                  if (confirm("Reject and delete this submission?")) rejectMutation.mutate(tool.id);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
      {pending.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No pending submissions.</p>
      )}
    </div>
  );
};

// ---- Add Tool Form ----
const AddToolForm = ({ categories: cats }: { categories: { slug: string; name: string; subcategories: { slug: string; name: string }[] }[] }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    domain: "",
    description: "",
    summary: "",
    category: "",
    subcategory: "",
    best_for: "Everyone",
    pricing: "Free" as "Free" | "Freemium" | "Paid",
    rating: "4.0",
    featured: false,
  });

  const selectedCat = cats.find((c) => c.slug === form.category);

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tools").insert({
        name: form.name,
        domain: form.domain || null,
        description: form.description,
        summary: form.summary || null,
        category: form.category,
        subcategory: form.subcategory || null,
        best_for: form.best_for,
        pricing: form.pricing,
        rating: parseFloat(form.rating),
        is_approved: true,
        is_community_submitted: false,
        featured: form.featured,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast.success("Tool added!");
      setForm({
        name: "", domain: "", description: "", summary: "",
        category: "", subcategory: "", best_for: "Everyone",
        pricing: "Free", rating: "4.0", featured: false,
      });
    },
    onError: (err) => toast.error("Failed to add: " + (err as Error).message),
  });

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm";

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }}
      className="max-w-2xl space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tool Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="e.g. ChatGPT" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Domain</label>
          <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className={inputClass} placeholder="e.g. openai.com" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
        <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="One-line description" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Summary</label>
        <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className={inputClass + " resize-none"} placeholder="2-3 line summary" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })} className={inputClass}>
            <option value="">Select category</option>
            {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Subcategory</label>
          <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className={inputClass}>
            <option value="">Select subcategory</option>
            {selectedCat?.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Best For</label>
          <select value={form.best_for} onChange={(e) => setForm({ ...form, best_for: e.target.value })} className={inputClass}>
            {["Everyone", "Beginners", "Developers", "Creators", "Marketers"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Pricing</label>
          <select value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value as "Free" | "Freemium" | "Paid" })} className={inputClass}>
            {["Free", "Freemium", "Paid"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
          <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
        Featured tool
      </label>
      <button
        type="submit"
        disabled={addMutation.isPending}
        className="w-full px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {addMutation.isPending ? "Adding..." : "Add Tool"}
      </button>
    </form>
  );
};

export default AdminPage;
