import { Link } from "react-router-dom";
import type { Category } from "@/data/categories";

const CategoryCard = ({ category }: { category: Category }) => {
  const Icon = category.icon;
  
  return (
    <Link
      to={`/${category.slug}`}
      className="group block rounded-xl border border-border bg-card p-6 hover-lift"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon size={24} />
      </div>
      <h3 className="font-heading text-lg font-semibold text-card-foreground mb-1">
        {category.name}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {category.description}
      </p>
      {category.subcategories.length > 0 && (
        <p className="mt-3 text-xs text-accent font-medium">
          {category.subcategories.length} {category.subcategories.length === 1 ? "subcategory" : "subcategories"} →
        </p>
      )}
    </Link>
  );
};

export default CategoryCard;
