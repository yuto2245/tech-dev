import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let serverClient: SupabaseClient | null = null;

export const getSupabaseServerClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase server-side環境変数が設定されていません。");
  }

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });
  }

  return serverClient;
};
