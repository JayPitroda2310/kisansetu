import { supabase } from './client';

/**
 * Upload a file to Supabase Storage with automatic bucket creation
 */
export async function uploadFile(
  bucketName: string,
  filePath: string,
  file: File
): Promise<{ publicUrl: string | null; error: Error | null }> {
  try {
    // Try to upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      return { publicUrl: null, error: new Error(error.message) };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { publicUrl, error: null };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { publicUrl: null, error };
  }
}

/**
 * Upload multiple images to product-images bucket
 */
export async function uploadProductImages(
  userId: string,
  files: File[]
): Promise<{ urls: string[]; error: Error | null }> {
  const imageUrls: string[] = [];
  
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`;
      
      const { publicUrl, error } = await uploadFile(
        'make-8192211d-product-images',
        fileName,
        file
      );
      
      if (error) {
        throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
      }
      
      if (publicUrl) {
        imageUrls.push(publicUrl);
      }
    }
    
    return { urls: imageUrls, error: null };
  } catch (error: any) {
    return { urls: [], error };
  }
}

/**
 * Upload a certificate to KYC documents bucket
 */
export async function uploadCertificate(
  userId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-certificate.${fileExt}`;
    
    const { publicUrl, error } = await uploadFile(
      'make-8192211d-kyc-documents',
      fileName,
      file
    );
    
    if (error) {
      return { url: null, error };
    }
    
    return { url: publicUrl, error: null };
  } catch (error: any) {
    return { url: null, error };
  }
}

/**
 * Check if storage buckets exist and are accessible
 */
export async function checkStorageBuckets(): Promise<{
  exists: boolean;
  buckets: string[];
  error: Error | null;
}> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return { exists: false, buckets: [], error: new Error(error.message) };
    }
    
    const requiredBuckets = [
      'make-8192211d-product-images',
      'make-8192211d-user-avatars',
      'make-8192211d-kyc-documents'
    ];
    
    const existingBucketNames = buckets?.map(b => b.name) || [];
    const allExist = requiredBuckets.every(name => 
      existingBucketNames.includes(name)
    );
    
    return {
      exists: allExist,
      buckets: existingBucketNames,
      error: null
    };
  } catch (error: any) {
    return { exists: false, buckets: [], error };
  }
}
