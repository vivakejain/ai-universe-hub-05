import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PRODUCT_HUNT_API_URL = "https://api.producthunt.com/v2/api/graphql";
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const AI_TOPIC_SLUG = "artificial-intelligence";
const AI_TOPIC_NAME = "Artificial Intelligence";
const LOOKBACK_HOURS = 24;
const MAX_POSTS = 10;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ToolPost = {
  id: string;
  name: string;
  tagline: string;
  websiteUrl: string | null;
  thumbnailUrl: string | null;
  votesCount: number;
  productHuntUrl: string;
  topics: Array<{ name: string; slug: string }>;
};

type ExistingAiTool = {
  id: string;
  name: string;
  trend_score: number | null;
  upvotes: number | null;
  summary: string | null;
};

type JsonRecord = Record<string, unknown>;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST" && request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const productHuntApiKey = Deno.env.get("PRODUCT_HUNT_API_KEY");
  const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

  const missingSecrets: string[] = [];
  if (!supabaseUrl) missingSecrets.push("SUPABASE_URL");
  if (!serviceRoleKey) missingSecrets.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!productHuntApiKey) missingSecrets.push("PRODUCT_HUNT_API_KEY");
  if (!openAiApiKey) missingSecrets.push("OPENAI_API_KEY");

  if (missingSecrets.length > 0) {
    const message = `Missing required secrets: ${missingSecrets.join(", ")}`;
    console.error("scrape-product-hunt config error", { missingSecrets });
    return jsonResponse({ error: message }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const posts = await fetchTopAiPosts(productHuntApiKey);

    if (posts.length === 0) {
      return jsonResponse({
        ok: true,
        fetched: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [],
        message: "No Product Hunt AI posts found in the last 24 hours.",
      });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: JsonRecord[] = [];

    for (const post of posts) {
      try {
        const summary = await generateSummary(openAiApiKey, post.name, post.tagline);
        const existing = await findExistingTool(supabase, post);

        if (existing) {
          const newTrendScore = (existing.trend_score ?? 0) + post.votesCount;
          const updatePayload: JsonRecord = {
            trend_score: newTrendScore,
            upvotes: Math.max(existing.upvotes ?? 0, post.votesCount),
            source: "product_hunt",
            source_url: post.productHuntUrl,
            logo_url: post.thumbnailUrl,
            updated_at: new Date().toISOString(),
          };

          if (!existing.summary) {
            updatePayload.summary = summary;
          }

          const { error: updateError } = await supabase
            .from("ai_tools")
            .update(updatePayload)
            .eq("id", existing.id);

          if (updateError) {
            throw updateError;
          }

          updated += 1;
          continue;
        }

        const slug = await buildUniqueSlug(supabase, post.name, post.id);

        const { error: insertError } = await supabase.from("ai_tools").insert({
          name: post.name,
          slug,
          description: post.tagline || `${post.name} discovered from Product Hunt.`,
          summary,
          website_url: post.websiteUrl,
          logo_url: post.thumbnailUrl,
          category: "Artificial Intelligence",
          tags: dedupeTags(["product_hunt", "artificial-intelligence"]),
          pricing_type: null,
          pricing_details: null,
          trend_score: post.votesCount,
          upvotes: post.votesCount,
          source: "product_hunt",
          source_url: post.productHuntUrl,
          is_verified: false,
          is_featured: false,
        });

        if (insertError) {
          throw insertError;
        }

        inserted += 1;
      } catch (error) {
        skipped += 1;
        const issue = {
          post: post.name,
          error: toErrorMessage(error),
        };
        console.error("scrape-product-hunt per-post failure", issue);
        errors.push(issue);
      }
    }

    return jsonResponse({
      ok: true,
      fetched: posts.length,
      inserted,
      updated,
      skipped,
      errors,
    });
  } catch (error) {
    const message = toErrorMessage(error);
    console.error("scrape-product-hunt fatal error", { error: message });
    return jsonResponse({
      ok: false,
      error: message,
    }, 500);
  }
});

function jsonResponse(payload: JsonRecord, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function fetchTopAiPosts(apiKey: string): Promise<ToolPost[]> {
  const postedAfter = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();

  const topicQuery = `
    query TopicPosts($topicSlug: String!, $first: Int!, $postedAfter: DateTime!) {
      topic(slug: $topicSlug) {
        posts(first: $first, order: VOTES, postedAfter: $postedAfter) {
          edges {
            node {
              id
              name
              tagline
              url
              website
              votesCount
              thumbnail {
                url
              }
              topics {
                edges {
                  node {
                    name
                    slug
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const fallbackQuery = `
    query LatestPosts($first: Int!, $postedAfter: DateTime!) {
      posts(first: $first, order: VOTES, postedAfter: $postedAfter) {
        edges {
          node {
            id
            name
            tagline
            url
            website
            votesCount
            thumbnail {
              url
            }
            topics {
              edges {
                node {
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const topicData = await callProductHuntGraphql<{
      topic?: { posts?: { edges?: Array<{ node?: unknown }> } };
    }>(apiKey, topicQuery, {
      topicSlug: AI_TOPIC_SLUG,
      first: MAX_POSTS,
      postedAfter,
    });

    const topicEdges = topicData.topic?.posts?.edges ?? [];
    const parsed = topicEdges
      .map((edge) => mapToolPost(edge.node))
      .filter((post): post is ToolPost => post !== null)
      .sort((a, b) => b.votesCount - a.votesCount)
      .slice(0, MAX_POSTS);

    if (parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error("Topic-specific Product Hunt query failed; trying fallback", {
      error: toErrorMessage(error),
    });
  }

  const fallbackData = await callProductHuntGraphql<{
    posts?: { edges?: Array<{ node?: unknown }> };
  }>(apiKey, fallbackQuery, {
    first: 50,
    postedAfter,
  });

  const fallbackEdges = fallbackData.posts?.edges ?? [];
  const parsedFallback = fallbackEdges
    .map((edge) => mapToolPost(edge.node))
    .filter((post): post is ToolPost => post !== null)
    .filter((post) => isAiTopic(post.topics))
    .sort((a, b) => b.votesCount - a.votesCount)
    .slice(0, MAX_POSTS);

  return parsedFallback;
}

async function callProductHuntGraphql<T>(
  apiKey: string,
  query: string,
  variables: JsonRecord,
): Promise<T> {
  const response = await fetch(PRODUCT_HUNT_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Product Hunt request failed: ${response.status} ${response.statusText}`);
  }

  if (payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
    const messages = payload.errors
      .map((entry: { message?: string }) => entry.message ?? "Unknown Product Hunt GraphQL error")
      .join("; ");
    throw new Error(`Product Hunt GraphQL error: ${messages}`);
  }

  return (payload?.data ?? {}) as T;
}

function mapToolPost(rawNode: unknown): ToolPost | null {
  const node = (rawNode ?? {}) as {
    id?: string;
    name?: string;
    tagline?: string;
    url?: string;
    website?: string;
    votesCount?: number;
    thumbnail?: { url?: string | null };
    topics?: { edges?: Array<{ node?: { name?: string; slug?: string } }> };
  };

  if (!node.id || !node.name || !node.url) {
    return null;
  }

  const websiteUrl = normalizeUrl(node.website ?? null);
  const productHuntUrl = normalizeUrl(node.url) ?? node.url;
  const thumbnailUrl = normalizeUrl(node.thumbnail?.url ?? null);

  const topics = (node.topics?.edges ?? [])
    .map((edge) => edge.node)
    .filter((topic): topic is { name?: string; slug?: string } => Boolean(topic))
    .map((topic) => ({
      name: (topic.name ?? "").trim(),
      slug: (topic.slug ?? "").trim(),
    }))
    .filter((topic) => topic.name.length > 0 || topic.slug.length > 0);

  return {
    id: String(node.id),
    name: node.name.trim(),
    tagline: (node.tagline ?? "").trim(),
    websiteUrl,
    thumbnailUrl,
    votesCount: Number.isFinite(node.votesCount) ? Number(node.votesCount) : 0,
    productHuntUrl,
    topics,
  };
}

function isAiTopic(topics: Array<{ name: string; slug: string }>): boolean {
  return topics.some((topic) => {
    const slug = topic.slug.toLowerCase();
    const name = topic.name.toLowerCase();
    return slug === AI_TOPIC_SLUG || name === AI_TOPIC_NAME.toLowerCase();
  });
}

function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const input = raw.trim();
  if (!input) return null;

  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  try {
    const url = new URL(candidate);
    url.hash = "";
    url.search = "";
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    url.pathname = normalizedPath || "/";
    return `${url.origin}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return null;
  }
}

async function generateSummary(apiKey: string, name: string, tagline: string): Promise<string> {
  const prompt =
    `You are a tech journalist. Write a 4-sentence summary of this AI tool for a directory website. ` +
    `Be specific about what it does, who it's for, and what makes it unique. Tool: ${name} - ${tagline}`;

  try {
    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content: "Return exactly four concise sentences.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const apiError = payload?.error?.message ?? `${response.status} ${response.statusText}`;
      throw new Error(`OpenAI request failed: ${apiError}`);
    }

    const summary = payload?.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("OpenAI response did not include summary content");
    }

    return summary;
  } catch (error) {
    console.error("OpenAI summary generation failed; using fallback", {
      name,
      error: toErrorMessage(error),
    });

    const safeTagline = tagline && tagline.trim().length > 0
      ? tagline.trim()
      : "This tool is actively discussed by Product Hunt users.";

    return [
      `${name} is an AI tool highlighted on Product Hunt in the last 24 hours.`,
      `${safeTagline.endsWith(".") ? safeTagline : `${safeTagline}.`}`,
      "It is likely relevant for builders, operators, and teams exploring practical AI workflows.",
      "Its recent vote activity suggests growing interest compared to similar launches.",
    ].join(" ");
  }
}

async function findExistingTool(supabase: ReturnType<typeof createClient>, post: ToolPost): Promise<ExistingAiTool | null> {
  if (post.websiteUrl) {
    const { data: byWebsite, error: byWebsiteError } = await supabase
      .from("ai_tools")
      .select("id, name, trend_score, upvotes, summary")
      .eq("website_url", post.websiteUrl)
      .limit(1)
      .maybeSingle();

    if (byWebsiteError) {
      throw byWebsiteError;
    }

    if (byWebsite) {
      return byWebsite as ExistingAiTool;
    }
  }

  const { data: byName, error: byNameError } = await supabase
    .from("ai_tools")
    .select("id, name, trend_score, upvotes, summary")
    .eq("name", post.name)
    .limit(1)
    .maybeSingle();

  if (byNameError) {
    throw byNameError;
  }

  return (byName as ExistingAiTool | null) ?? null;
}

async function buildUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  name: string,
  postId: string,
): Promise<string> {
  const baseSlug = slugify(name) || `tool-${crypto.randomUUID().slice(0, 8)}`;

  const attempts = [
    baseSlug,
    `${baseSlug}-${slugify(postId).slice(0, 12)}`,
    `${baseSlug}-${new Date().getTime().toString().slice(-6)}`,
  ];

  for (const candidate of attempts) {
    const trimmed = candidate.slice(0, 120);
    const { data, error } = await supabase
      .from("ai_tools")
      .select("id")
      .eq("slug", trimmed)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return trimmed;
    }
  }

  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`.slice(0, 120);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dedupeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)));
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}
