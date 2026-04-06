import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Problem {
  id: string;
  user_id: string;
  problem_type: string;
  input_method: 'text' | 'image';
  problem_text: string;
  problem_image_url?: string;
  solution: {
    steps: Array<{
      step: number;
      description: string;
      equation?: string;
    }>;
    final_answer: string;
    graphs?: string[];
  };
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  problem_id: string;
  user_id: string;
  question: string;
  answer: string;
  created_at: string;
}
