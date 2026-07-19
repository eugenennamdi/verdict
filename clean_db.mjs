import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const cutoff = new Date('2026-07-19T07:20:00Z').toISOString();
  console.log('Deleting reports older than', cutoff);
  const { error } = await supabaseAdmin
    .from('reports')
    .delete()
    .lt('created_at', cutoff);
    
  if (error) {
    console.error(error);
  } else {
    console.log('Old test data cleaned.');
  }
}

main();
