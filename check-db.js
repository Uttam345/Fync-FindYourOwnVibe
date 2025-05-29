// Check Supabase database setup
console.log('=== FYNC DATABASE SETUP VERIFICATION ===');

// Test 1: Check if we can connect to Supabase
import { supabase } from './src/lib/supabase.js';

(async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', user ? `Logged in as ${user.email}` : 'Not logged in');
    
    // Check if tables exist
    const tables = ['profiles', 'events', 'connections', 'chats', 'memories'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`❌ Table '${table}' does not exist`);
          } else {
            console.log(`❌ Error accessing '${table}':`, error.message);
          }
        } else {
          console.log(`✅ Table '${table}' is accessible`);
        }
      } catch (err) {
        console.log(`❌ Failed to check table '${table}':`, err.message);
      }
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('If tables are missing, please create them in your Supabase dashboard.');
    console.log('Visit: https://app.supabase.com → Your project → Table Editor');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
})();
