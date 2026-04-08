import {
  Pen, Image, Code, Zap, Megaphone, GraduationCap, Briefcase,
  Music, Users, BookOpen, MessageSquare, Newspaper, FileText, Send
} from "lucide-react";

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  icon: any;
  subcategories: SubCategory[];
}

export const categories: Category[] = [
  {
    name: "AI for Content Creation",
    slug: "ai-content-creation",
    description: "Tools for writing, blogging, scripts, social media, and email marketing.",
    icon: Pen,
    subcategories: [
      { name: "Writing and Blogs", slug: "writing-blogs" },
      { name: "Scripts and Copywriting", slug: "scripts-copywriting" },
      { name: "Social Media Content", slug: "social-media-content" },
      { name: "Email Marketing", slug: "email-marketing" },
    ],
  },
  {
    name: "AI for Visual Creation",
    slug: "ai-visual-creation",
    description: "Image generation, video creation, design, branding, and animation.",
    icon: Image,
    subcategories: [
      { name: "Image Generation", slug: "image-generation" },
      { name: "Video Creation", slug: "video-creation" },
      { name: "Design and Branding", slug: "design-branding" },
      { name: "Animation", slug: "animation" },
    ],
  },
  {
    name: "AI for Developers",
    slug: "ai-for-developers",
    description: "Coding assistants, app builders, website builders, and testing tools.",
    icon: Code,
    subcategories: [
      { name: "Coding Assistants", slug: "coding-assistants" },
      { name: "App Builders", slug: "app-builders" },
      { name: "Website Builders", slug: "website-builders" },
      { name: "Testing and Debugging", slug: "testing-debugging" },
    ],
  },
  {
    name: "AI for Productivity",
    slug: "ai-productivity",
    description: "Automation, workflow management, meetings, scheduling, and notes.",
    icon: Zap,
    subcategories: [
      { name: "Automation Tools", slug: "automation-tools" },
      { name: "Workflow Management", slug: "workflow-management" },
      { name: "Meeting and Scheduling", slug: "meeting-scheduling" },
      { name: "Note Taking", slug: "note-taking" },
    ],
  },
  {
    name: "AI for Marketing",
    slug: "ai-marketing",
    description: "SEO, ad creation, analytics, and social media management.",
    icon: Megaphone,
    subcategories: [
      { name: "SEO Tools", slug: "seo-tools" },
      { name: "Ad Creation", slug: "ad-creation" },
      { name: "Analytics", slug: "analytics" },
      { name: "Social Media Management", slug: "social-media-management" },
    ],
  },
  {
    name: "AI for Learning",
    slug: "ai-learning",
    description: "Courses, certifications, research papers, and educational content.",
    icon: GraduationCap,
    subcategories: [
      { name: "Generative AI", slug: "generative-ai" },
      { name: "Machine Learning", slug: "machine-learning" },
      { name: "Deep Learning", slug: "deep-learning" },
      { name: "AI for Business and Non Tech People", slug: "ai-for-non-tech" },
      { name: "Prompt Engineering", slug: "prompt-engineering" },
      { name: "AI Ethics and Safety", slug: "ai-ethics" },
      { name: "Data Science and Analytics", slug: "data-science" },
      { name: "AI Research and Papers", slug: "ai-research" },
      { name: "YouTube Channels and Educators", slug: "youtube-educators" },
      { name: "Certifications and Courses", slug: "certifications-courses" },
    ],
  },
  {
    name: "AI for Business",
    slug: "ai-business",
    description: "Finance, customer support, sales, HR, and recruiting tools.",
    icon: Briefcase,
    subcategories: [
      { name: "Finance and Forecasting", slug: "finance-forecasting" },
      { name: "Customer Support", slug: "customer-support" },
      { name: "Sales Tools", slug: "sales-tools" },
      { name: "HR and Recruiting", slug: "hr-recruiting" },
    ],
  },
  {
    name: "AI for Audio and Music",
    slug: "ai-audio-music",
    description: "Music generation, voiceovers, podcast tools, and sound editing.",
    icon: Music,
    subcategories: [
      { name: "Music Generation", slug: "music-generation" },
      { name: "Voiceovers", slug: "voiceovers" },
      { name: "Podcast Tools", slug: "podcast-tools" },
      { name: "Sound Editing", slug: "sound-editing" },
    ],
  },
  {
    name: "People to Follow",
    slug: "people-to-follow",
    description: "Researchers, educators, YouTubers, creators, and industry leaders.",
    icon: Users,
    subcategories: [
      { name: "Researchers", slug: "researchers" },
      { name: "Educators", slug: "educators" },
      { name: "YouTubers and Creators", slug: "youtubers-creators" },
      { name: "Industry Leaders", slug: "industry-leaders" },
    ],
  },
  {
    name: "Prompt Library",
    slug: "prompt-library",
    description: "Ready-to-use prompts for writing, images, coding, and business.",
    icon: BookOpen,
    subcategories: [
      { name: "Writing Prompts", slug: "writing-prompts" },
      { name: "Image Prompts", slug: "image-prompts" },
      { name: "Coding Prompts", slug: "coding-prompts" },
      { name: "Business Prompts", slug: "business-prompts" },
    ],
  },
  {
    name: "Community Submissions",
    slug: "community-submissions",
    description: "Tools submitted by the community, reviewed and approved.",
    icon: Send,
    subcategories: [],
  },
  {
    name: "AI Glossary",
    slug: "ai-glossary",
    description: "AI terms explained in simple, beginner-friendly language.",
    icon: FileText,
    subcategories: [],
  },
  {
    name: "AI News",
    slug: "ai-news",
    description: "Latest AI updates, launches, and industry news.",
    icon: Newspaper,
    subcategories: [],
  },
];
