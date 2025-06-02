# FYNC Database & Storage Setup Instructions

This document provides step-by-step instructions to set up the database and storage for the FYNC application with proper image upload functionality.

## Current Status
✅ **Code Updates Complete:**
- OnboardingProcess.jsx updated to use image upload service
- AuthService.js updated to handle file uploads during signup
- ImageUploadService.js created for Supabase Storage integration
- Database schema updated to store image URLs instead of base64

## Next Steps Required

### Step 1: Set Up Database and Storage in Supabase Dashboard

1. **Open your Supabase Dashboard:**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your FYNC project

2. **Execute the Complete Setup Script:**
   - Navigate to `SQL Editor` in the left sidebar
   - Click `New Query`
   - Copy and paste the entire contents of `complete-database-setup.sql` 
   - Click `Run` to execute the script

3. **Verify the Setup:**
   - You should see success messages in the Results panel
   - Check that the `profiles` table exists in `Table Editor`
   - Check that the `profile-pictures` bucket exists in `Storage`

### Step 2: Test the Setup

1. **Run the Test Script:**
   ```bash
   cd "d:\MOKSH\WEB DEVELOPMENT\FYNC\FYNC"
   node test-signup-with-images.js
   ```

2. **Expected Results:**
   - All test steps should pass with ✅ checkmarks
   - The script will create a test user, upload an image, and verify everything works
   - It will clean up the test data automatically

### Step 3: Test the Frontend

1. **Start the Development Server:**
   ```bash
   npm run dev
   ```

2. **Test the Complete Signup Flow:**
   - Open the app in your browser
   - Go through the onboarding process
   - Upload a profile picture in step 3
   - Complete the registration
   - Verify that:
     - User appears in Supabase Auth dashboard
     - Profile appears in profiles table
     - Image appears in Storage bucket
     - User is successfully logged into the main app

## What the Setup Script Does

### Database Setup:
- ✅ Creates/updates the `profiles` table with all required columns
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates indexes for better performance
- ✅ Adds triggers for automatic timestamp updates

### Storage Setup:
- ✅ Creates the `profile-pictures` storage bucket
- ✅ Sets file size limit to 5MB
- ✅ Restricts to image file types only
- ✅ Sets up storage policies for secure access

### Key Features:
- **Security:** Users can only upload/modify their own images
- **Public Access:** All profile images are publicly viewable
- **File Validation:** Only image files under 5MB are allowed
- **URL Storage:** Profile images are stored as URLs, not base64

## Troubleshooting

### If the test script fails:
1. **Check RLS Policies:** Ensure the SQL script ran completely without errors
2. **Check Storage Bucket:** Verify the bucket exists in Supabase Storage
3. **Check Permissions:** Ensure your Supabase key has the correct permissions

### If signup fails in the frontend:
1. **Check Browser Console:** Look for detailed error messages
2. **Check Network Tab:** Verify API calls are succeeding
3. **Check Supabase Logs:** View real-time logs in the Supabase dashboard

### Common Issues:
- **RLS Policy Error (42501):** The database script didn't run completely
- **Storage Upload Error:** The storage bucket or policies are missing
- **Image Not Loading:** Check the public URL generation and storage policies

## File Structure After Setup

```
FYNC/
├── complete-database-setup.sql     ← Execute this in Supabase Dashboard
├── test-signup-with-images.js      ← Run this to test the setup
├── src/
│   ├── components/
│   │   └── OnboardingProcess.jsx   ← Updated for image upload
│   └── services/
│       ├── authService.js          ← Updated for image handling
│       └── imageUploadService.js   ← New service for image uploads
```

## Next Steps After Setup

Once the database and storage are set up and tested:

1. **Remove Debug Components:** Clean up any remaining debug components
2. **Test All Flows:** Verify login, signup, and profile editing work
3. **Optimize Images:** Consider adding image compression/resizing
4. **Add Error Handling:** Enhance user-facing error messages
5. **Performance Testing:** Test with larger files and multiple users

## Contact
If you encounter any issues during setup, check the Supabase dashboard logs and browser console for detailed error messages.
