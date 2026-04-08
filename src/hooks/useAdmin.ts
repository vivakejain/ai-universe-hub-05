import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbTool } from "./useTools";

// Admin uses a service-role-like approach via RLS bypass for admin.
// Since we don't have auth, we'll create an edge function for admin ops.
// For now, we use a simple RPC approach with a secret admin key.

const ADMIN_KEY_STORAGE = "ea360_admin_key";

export const getAdminKey = () => localStorage.getItem(ADMIN_KEY_STORAGE);
export const setAdminKey = (key: string) => localStorage.setItem(ADMIN_KEY_STORAGE, key);
export const clearAdminKey = () => localStorage.removeItem(ADMIN_KEY_STORAGE);

export const useAllTools = () =>
  useQuery({
    queryKey: ["admin", "tools"],
    queryFn: async () => {
      // This will only return approved tools due to RLS
      // We need edge function for full admin access
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbTool[];
    },
  });

export const usePendingTools = () =>
  useQuery({
    queryKey: ["admin", "tools", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Filter pending on client (RLS only returns approved)
      return (data as DbTool[]).filter((t) => !t.is_approved);
    },
  });

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*");
      if (error) throw error;
      const tools = data as DbTool[];
      return {
        total: tools.length,
        approved: tools.filter((t) => t.is_approved).length,
        pending: tools.filter((t) => !t.is_approved).length,
        communitySubmitted: tools.filter((t) => t.is_community_submitted).length,
      };
    },
  });
