import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ToolCard from "@/components/ToolCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import CommunityBanner from "@/components/CommunityBanner";
import { categories } from "@/data/categories";
import { useFeaturedTools, useRecentTools } from "@/hooks/useTools";

const Index = () => {
  const mainCategories = categories.filter(c => !["community-submissions", "ai-glossary", "ai-news"].includes(c.slug));
  const { data: featured, isLoading: featuredLoading } = useFeaturedTools();
  const { data: recent, isLoading: recentLoading } = useRecentTools();

  const SkeletonGrid = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">Explore Categories</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            Browse AI tools and resources organized by what you need them for.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mainCategories.map(cat => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-muted">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">Featured Tools</h2>
          <p className="text-muted-foreground text-center mb-10">Hand-picked tools that stand out from the crowd.</p>
          {featuredLoading ? <SkeletonGrid /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured?.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterSignup />

      {/* Recently Added */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">Recently Added</h2>
          <p className="text-muted-foreground text-center mb-10">Fresh finds added to the collection.</p>
          {recentLoading ? <SkeletonGrid /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent?.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CommunityBanner />
    </>
  );
};

export default Index;
