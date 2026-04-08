import { Link } from "react-router-dom";
import { Send } from "lucide-react";

const CommunityBanner = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="hero-gradient rounded-2xl p-8 md:p-12 text-center">
          <Send className="mx-auto mb-4 text-accent" size={40} />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Know a tool we missed?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Help the community grow by submitting your favorite AI tools. It only takes a minute.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
          >
            Submit a Tool
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunityBanner;
