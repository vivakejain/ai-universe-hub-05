import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/categories?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>
      <div className="container relative py-20 md:py-32 text-center">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary-foreground mb-4 animate-fade-up">
          Your Complete Guide to{" "}
          <span className="text-gradient">Everything AI</span>
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Discover tools, courses, people and resources across the entire AI universe
        </p>
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto flex gap-2 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search AI tools, categories, or terms..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border-0 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Newsletter in hero */}
        <div className="mt-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-primary-foreground/70 text-sm mb-3">Join 10,000+ AI enthusiasts</p>
          <form
            onSubmit={e => e.preventDefault()}
            className="max-w-md mx-auto flex gap-2"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2.5 rounded-lg border-0 bg-background/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm backdrop-blur"
            />
            <button className="px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
