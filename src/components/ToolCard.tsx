import { useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import type { DbTool } from "@/hooks/useTools";

const pricingColors: Record<string, string> = {
  Free: "bg-green-100 text-green-700",
  Freemium: "bg-blue-100 text-blue-700",
  Paid: "bg-amber-100 text-amber-700",
};

const ToolLogo = ({ tool }: { tool: DbTool }) => {
  const [failed, setFailed] = useState(false);
  if (!tool.domain || failed) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground font-heading font-bold text-lg">
        {tool.name.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={`https://logo.clearbit.com/${tool.domain}`}
      alt={`${tool.name} logo`}
      className="h-10 w-10 shrink-0 rounded-lg object-contain"
      onError={() => setFailed(true)}
    />
  );
};

const ToolCard = ({ tool }: { tool: DbTool }) => {
  const rating = tool.rating || 0;
  const pricing = tool.pricing || "Free";
  const bestFor = tool.best_for || "Everyone";

  return (
    <div className="group rounded-xl border border-border bg-card p-5 hover-lift flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <ToolLogo tool={tool} />
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-base font-semibold text-card-foreground truncate">
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
        {tool.summary}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          {bestFor}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pricingColors[pricing] || pricingColors.Free}`}>
          {pricing}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-border"}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">{rating}</span>
        </div>
        {tool.domain && (
          <a
            href={`https://${tool.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            Visit Tool <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

export default ToolCard;
