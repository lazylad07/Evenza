import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dbwrlwgdxtpzgfheaoqh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid3Jsd2dkeHRwemdmaGVhb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MTg0NTgsImV4cCI6MjA3NzI5NDQ1OH0.IJkjv9Go9dYWvCXW8bYjvw5-Qf0SuR3c9Y2Qjw7of3Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
