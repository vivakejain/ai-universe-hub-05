import { useState } from "react";
import { CheckCircle } from "lucide-react";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <h1 className="font-heading text-2xl font-bold mb-2">Message Sent!</h1>
        <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">Have a question, feedback, or partnership inquiry? Drop us a message.</p>

      <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
          <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
          <input required type="email" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Message *</label>
          <textarea required rows={5} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none" placeholder="What's on your mind?" />
        </div>
        <button type="submit" className="w-full px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactPage;
