import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function getServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
} 