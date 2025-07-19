import { createClient } from "./supabase/client";
import { createClient as createServerClient } from "./supabase/server";

// Legacy compatibility - redirect to new client
export { createClient as supabase };

// Server-side client for server actions
export { createServerClient };
