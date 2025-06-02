// Quick verification script for Supabase setup
// Run this to check if your Supabase project is properly configured
// Usage: node verify-supabase-setup.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySupabaseSetup() {
  console.log('🔍 Verifying Supabase Setup for FYNC...\n');

  const checks = {
    connection: false,
    profilesTable: false,
    profilesRLS: false,
    storageBucket: false,
    storagePolices: false
  };

  try {
    // Check 1: Basic connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (!healthError) {
      checks.connection = true;
      console.log('   ✅ Connected to Supabase successfully');
    } else {
      console.log('   ❌ Connection failed:', healthError.message);
    }

    // Check 2: Profiles table structure
    console.log('\n2️⃣ Checking profiles table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);
    
    if (!tableError) {
      checks.profilesTable = true;
      console.log('   ✅ Profiles table exists and is accessible');
    } else {
      console.log('   ❌ Profiles table issue:', tableError.message);
    }

    // Check 3: RLS policies (attempt to insert without auth)
    console.log('\n3️⃣ Testing RLS policies...');
    const { error: rlsError } = await supabase
      .from('profiles')
      .insert([{
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@test.com',
        name: 'Test'
      }]);
    
    if (rlsError && (rlsError.code === '42501' || rlsError.message.includes('policy'))) {
      checks.profilesRLS = true;
      console.log('   ✅ RLS policies are active and working');
    } else if (rlsError) {
      console.log('   ❌ RLS test failed:', rlsError.message);
    } else {
      console.log('   ⚠️  RLS might not be configured (insert succeeded without auth)');
    }

    // Check 4: Storage bucket
    console.log('\n4️⃣ Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (!bucketError) {
      const profileBucket = buckets.find(bucket => bucket.id === 'profile-pictures');
      if (profileBucket) {
        checks.storageBucket = true;
        console.log('   ✅ Profile pictures bucket exists');
        console.log(`   📁 Bucket config: Public=${profileBucket.public}, Size limit=${profileBucket.file_size_limit || 'unlimited'}`);
      } else {
        console.log('   ❌ Profile pictures bucket not found');
        console.log('   📋 Available buckets:', buckets.map(b => b.id).join(', ') || 'None');
      }
    } else {
      console.log('   ❌ Storage access failed:', bucketError.message);
    }

    // Check 5: Storage policies (attempt to upload without auth)
    console.log('\n5️⃣ Testing storage policies...');
    const testFile = new Uint8Array([137, 80, 78, 71]); // PNG file header
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload('test-unauthorized/test.png', testFile);
    
    if (uploadError && uploadError.message.includes('policy')) {
      checks.storagePolices = true;
      console.log('   ✅ Storage policies are active and working');
    } else if (uploadError) {
      console.log('   ❌ Storage policy test failed:', uploadError.message);
    } else {
      console.log('   ⚠️  Storage policies might not be configured (upload succeeded without auth)');
    }

    // Summary
    console.log('\n📊 Setup Summary:');
    console.log('='.repeat(50));
    Object.entries(checks).forEach(([check, passed]) => {
      const status = passed ? '✅' : '❌';
      const name = check.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`${status} ${name}`);
    });

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    console.log(`\n🎯 Score: ${passedChecks}/${totalChecks} checks passed`);

    if (passedChecks === totalChecks) {
      console.log('\n🎉 Perfect! Your Supabase setup is ready for FYNC.');
      console.log('👍 You can now test the signup flow in the frontend.');
    } else if (passedChecks >= 3) {
      console.log('\n⚠️  Most checks passed, but some issues detected.');
      console.log('💡 Run the complete-database-setup.sql script if you haven\'t already.');
    } else {
      console.log('\n❌ Multiple issues detected. Setup is incomplete.');
      console.log('🔧 Please run the complete-database-setup.sql script in your Supabase dashboard.');
    }

  } catch (error) {
    console.error('\n💥 Verification failed with error:', error.message);
    console.error('🔧 Please check your Supabase URL and API key configuration.');
  }
}

// Run verification
verifySupabaseSetup();
