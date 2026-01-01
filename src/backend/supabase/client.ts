import { createClient } from "@supabase/supabase-js";

// Use Vite env variables (VITE_ prefix) so the client bundle can read them
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn(
		"VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Add them to your .env file to connect to Supabase."
	);
}

// Create client with dummy values if env vars missing (prevents app crash)
// API calls will fail gracefully with error messages instead of crashing
export const supabase = createClient(
	supabaseUrl || "https://placeholder.supabase.co", 
	supabaseAnonKey || "placeholder-anon-key"
);