import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { categories } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";
import ToolCard from "@/components/ToolCard";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find(c => c.slug === slug);
  const tools = getToolsByCategory(slug || "");

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold mb-4">Category not found</h1>
        <Link to="/" className="text-accent hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="container py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-accent">
          <Icon size={28} />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {category.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {category.subcategories.map(sub => (
            <span
              key={sub.slug}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground border border-border"
            >
              {sub.name}
            </span>
          ))}
        </div>
      )}

      {tools.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No tools listed here yet.</p>
          <Link to="/submit" className="text-accent hover:underline">Submit one →</Link>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
