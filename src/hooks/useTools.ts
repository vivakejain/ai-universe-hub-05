import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DbTool = {
  id: string;
  name: string;
  domain: string | null;
  description: string;
  summary: string | null;
  category: string;
  subcategory: string | null;
  best_for: string | null;
  pricing: string | null;
  rating: number | null;
  is_approved: boolean;
  is_community_submitted: boolean;
  submitter_email: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export const useApprovedTools = () =>
  useQuery({
    queryKey: ["tools", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbTool[];
    },
  });

export const useFeaturedTools = () =>
  useQuery({
    queryKey: ["tools", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_approved", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as DbTool[];
    },
  });

export const useRecentTools = () =>
  useQuery({
    queryKey: ["tools", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as DbTool[];
    },
  });

export const useToolsByCategory = (slug: string) =>
  useQuery({
    queryKey: ["tools", "category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_approved", true)
        .eq("category", slug)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbTool[];
    },
    enabled: !!slug,
  });

export const useSearchTools = (query: string) =>
  useQuery({
    queryKey: ["tools", "search", query],
    queryFn: async () => {
      const q = query.trim();
      if (!q) return [];
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_approved", true)
        .or(
          `name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,subcategory.ilike.%${q}%`
        )
        .order("rating", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as DbTool[];
    },
    enabled: query.trim().length > 0,
  });
