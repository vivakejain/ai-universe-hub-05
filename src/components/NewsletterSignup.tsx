const NewsletterSignup = () => {
  return (
    <section className="py-16 bg-secondary">
      <div className="container text-center">
        <h2 className="font-heading text-3xl font-bold text-secondary-foreground mb-2">
          Get 5 Fresh AI Tools Every Week
        </h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Join our newsletter and stay ahead of the AI curve. No spam, just the best tools and resources delivered to your inbox.
        </p>
        <form onSubmit={e => e.preventDefault()} className="max-w-md mx-auto flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
          <button className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSignup;
