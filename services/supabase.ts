import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ohsvzndgmefzvxyxubyq.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oc3Z6bmRnbWVmenZ4eXh1YnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mzk1ODcsImV4cCI6MjA3OTIxNTU4N30.U4GruS9l87XAul1LEZ0S7rqnZAe5yTUwKYQ-PsLkIYg';

console.log('Supabase client initializing...');
console.log('URL:', supabaseUrl);
console.log('Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized successfully');
