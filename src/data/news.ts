export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
}

export const newsItems: NewsItem[] = [
  { id: "1", title: "GPT-5 Rumors: What We Know So Far", excerpt: "OpenAI is reportedly working on their next-generation model with significant improvements in reasoning and multimodal capabilities.", date: "2026-04-07", category: "Models", readTime: "4 min" },
  { id: "2", title: "Google Launches Gemini 2.0 Ultra", excerpt: "Google's latest AI model brings native multimodal understanding, improved coding abilities, and a 2M token context window.", date: "2026-04-06", category: "Models", readTime: "3 min" },
  { id: "3", title: "The Rise of AI Agents in 2026", excerpt: "Autonomous AI agents are transforming how businesses operate. Here's a look at the most promising agent frameworks.", date: "2026-04-05", category: "Trends", readTime: "6 min" },
  { id: "4", title: "EU AI Act: What Developers Need to Know", excerpt: "The European Union's AI regulations are now in effect. Here's a practical guide for developers and businesses.", date: "2026-04-04", category: "Policy", readTime: "5 min" },
  { id: "5", title: "Open Source AI Models Catching Up Fast", excerpt: "Meta's Llama 4 and Mistral's latest models are closing the gap with proprietary alternatives at a rapid pace.", date: "2026-04-03", category: "Open Source", readTime: "4 min" },
  { id: "6", title: "10 AI Tools That Launched This Week", excerpt: "A roundup of the most interesting new AI tools and platforms that launched in the past seven days.", date: "2026-04-02", category: "Tools", readTime: "3 min" },
];
