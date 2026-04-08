import { newsItems } from "@/data/news";
import { Clock } from "lucide-react";

const NewsPage = () => {
  return (
    <div className="container py-10">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">AI News</h1>
      <p className="text-muted-foreground mb-8">Latest updates, launches, and trends in the AI world.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {newsItems.map(item => (
          <article key={item.id} className="rounded-xl border border-border bg-card p-6 hover-lift">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} /> {item.readTime}
              </span>
            </div>
            <h2 className="font-heading text-lg font-semibold text-card-foreground mb-2">{item.title}</h2>
            <p className="text-sm text-muted-foreground mb-3">{item.excerpt}</p>
            <time className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
