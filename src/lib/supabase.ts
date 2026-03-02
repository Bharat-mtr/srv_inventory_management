import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export type Product = {
  id: string;
  name: string;
  price: number | null;
  description: string | null;
  is_available: boolean;
  created_at: string;
};

export type ProductPhoto = {
  id: string;
  product_id: string;
  photo_url: string;
  display_order: number;
  created_at: string;
};

export type Shopkeeper = {
  id: string;
  name: string;
  address: string | null;
  unique_code: string;
  created_at: string;
};

export type ProductVisibility = {
  product_id: string;
  shopkeeper_id: string;
};
