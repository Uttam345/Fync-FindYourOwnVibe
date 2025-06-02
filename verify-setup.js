// Quick verification script for Supabase setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ogspltrjsqigbikwzmgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc3BsdHJqc3FpZ2Jpa3d6bWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwOTQzMTUsImV4cCI6MjA0NzY3MDMxNX0.CXKJ_6lqLGiTZkkqEKMGpqLxfn0H_uJ3jqEgGxrNa0I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...\n');

  try {
    // Check profiles table
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    console.log('✅ Profiles table:', error ? `❌ ${error.message}` : '✅ Accessible');

    // Check storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    const hasBucket = buckets?.find(b => b.id === 'profile-pictures');
    console.log('📁 Storage bucket:', hasBucket ? '✅ Exists' : '❌ Missing');

  } catch (err) {
    console.error('❌ Setup verification failed:', err.message);
  }
}

verifySetup();
