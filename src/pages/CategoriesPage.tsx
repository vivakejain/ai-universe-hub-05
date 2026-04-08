import { Link } from "react-router-dom";
import CategoryCard from "@/components/CategoryCard";
import { categories } from "@/data/categories";

const CategoriesPage = () => {
  const mainCategories = categories.filter(c => !["community-submissions", "ai-glossary", "ai-news"].includes(c.slug));

  return (
    <div className="container py-10">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">All Categories</h1>
      <p className="text-muted-foreground mb-8">Browse the full directory of AI tools and resources.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mainCategories.map(cat => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
