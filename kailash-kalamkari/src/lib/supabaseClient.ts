import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhithcsradzkatkiaxcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaXRoY3NyYWR6a2F0a2lheGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTYzMjYsImV4cCI6MjA3NDUzMjMyNn0.yN1maPCb6cQPY7SeVP6Xl46t8NJgFcCx42IP0hslhuI';

export const supabase = createClient(supabaseUrl, supabaseKey);