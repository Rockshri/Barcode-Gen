import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztvnpqklnojyhlygsltb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0dm5wcWtsbm9qeWhseWdzbHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODM0MTQsImV4cCI6MjA4NzA1OTQxNH0.IxckPCN00eKO8pndmLqqVKmihnlsSk0JOksycLSrUxM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
