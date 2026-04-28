// Connected to external Supabase project (migrated from Lovable Cloud).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gcodvxjygeccwsikkuod.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjb2R2eGp5Z2VjY3dzaWtrdW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTY5MjMsImV4cCI6MjA5Mjg5MjkyM30.-I8NGyY3D6BBiVxSeu1WOVTJt9f5eGjSanIZOLj_i5I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
