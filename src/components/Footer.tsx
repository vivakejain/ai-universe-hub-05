import { Link } from "react-router-dom";
import { categories } from "@/data/categories";

const Footer = () => {
  const mainCategories = categories.filter(c => !["community-submissions", "ai-glossary", "ai-news"].includes(c.slug));

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-heading text-xl font-bold flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground text-xs font-bold">AI</span>
              EverythingAI360
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Your complete guide to the AI universe. Discover, learn, and build with AI.
            </p>
            {/* Newsletter */}
            <form onSubmit={e => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-md text-sm bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button className="px-3 py-2 rounded-md text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium">
                Join
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="md:col-span-2">
            <h4 className="font-heading font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/50">Categories</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {mainCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/${cat.slug}`}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/50">Links</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Submit a Tool", href: "/submit" },
                { label: "AI Glossary", href: "/ai-glossary" },
                { label: "AI News", href: "/ai-news" },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} EverythingAI360. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
