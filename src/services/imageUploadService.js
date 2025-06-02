import { supabase } from '../lib/supabase';

export class ImageUploadService {
  static async uploadProfilePicture(userId, file) {
    try {
      console.log('Starting profile picture upload for user:', userId);
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      console.log('Uploading file:', fileName);

      // Delete existing profile picture if it exists
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      if (deleteError && deleteError.message !== 'The resource was not found') {
        console.warn('Could not delete existing file:', deleteError);
      }

      // Upload new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      console.log('Public URL generated:', urlData.publicUrl);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName
      };

    } catch (error) {
      console.error('Profile picture upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async uploadCoverImage(userId, file) {
    try {
      console.log('Starting cover image upload for user:', userId);
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit for cover images
        throw new Error('File size must be less than 10MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cover.${fileExt}`;

      console.log('Uploading cover image:', fileName);

      // Delete existing cover image if it exists
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      if (deleteError && deleteError.message !== 'The resource was not found') {
        console.warn('Could not delete existing cover image:', deleteError);
      }

      // Upload new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Cover image upload failed:', uploadError);
        throw uploadError;
      }

      console.log('Cover image upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      console.log('Cover image public URL generated:', urlData.publicUrl);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName
      };

    } catch (error) {
      console.error('Cover image upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async deleteProfilePicture(userId) {
    try {
      const fileName = `${userId}/profile.jpg`; // Try common extensions
      const fileName2 = `${userId}/profile.png`;
      const fileName3 = `${userId}/profile.jpeg`;

      await supabase.storage
        .from('profile-pictures')
        .remove([fileName, fileName2, fileName3]);

      return { success: true };
    } catch (error) {
      console.error('Delete profile picture failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to get optimized image URL with transformations
  static getOptimizedImageUrl(originalUrl, width = 150, height = 150) {
    if (!originalUrl) return null;
    
    // For Supabase Storage, we can add transform parameters
    // This is a placeholder for future optimization
    return originalUrl;
  }

  // Validate image dimensions and compress if needed
  static async processImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
