import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ohsvzndgmefzvxyxubyq.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oc3Z6bmRnbWVmenZ4eXh1YnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mzk1ODcsImV4cCI6MjA3OTIxNTU4N30.U4GruS9l87XAul1LEZ0S7rqnZAe5yTUwKYQ-PsLkIYg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
