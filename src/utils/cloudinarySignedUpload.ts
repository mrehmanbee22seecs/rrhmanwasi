/**
 * Cloudinary Signed Upload Utilities
 *
 * Provides secure signed uploads via Supabase Edge Functions
 * for enhanced security and additional upload capabilities
 */

import axios from 'axios';

export interface SignedUploadOptions {
  file: File | Blob;
  folder?: string;
  transformation?: string;
  eager?: string;
  publicId?: string;
  onProgress?: (progress: number) => void;
}

export interface SignatureResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder?: string;
  transformation?: string;
  eager?: string;
  public_id?: string;
}

/**
 * Get signature from Supabase Edge Function
 */
async function getSignature(params: {
  timestamp: number;
  folder?: string;
  transformation?: string;
  eager?: string;
  public_id?: string;
}): Promise<SignatureResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const response = await axios.post(
    `${supabaseUrl}/functions/v1/cloudinary-signature`,
    params,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      }
    }
  );

  return response.data;
}

/**
 * Upload file to Cloudinary using signed upload
 *
 * @param options - Upload options
 * @returns Cloudinary upload response with secure_url
 */
export async function uploadWithSignature(
  options: SignedUploadOptions
): Promise<any> {
  const {
    file,
    folder = 'uploads',
    transformation,
    eager,
    publicId,
    onProgress
  } = options;

  const timestamp = Math.floor(Date.now() / 1000);

  const signatureParams: any = { timestamp };
  if (folder) signatureParams.folder = `wasilah/${folder}`;
  if (transformation) signatureParams.transformation = transformation;
  if (eager) signatureParams.eager = eager;
  if (publicId) signatureParams.public_id = publicId;

  const signatureData = await getSignature(signatureParams);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.api_key);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('signature', signatureData.signature);

  if (signatureData.folder) formData.append('folder', signatureData.folder);
  if (signatureData.transformation) formData.append('transformation', signatureData.transformation);
  if (signatureData.eager) formData.append('eager', signatureData.eager);
  if (signatureData.public_id) formData.append('public_id', signatureData.public_id);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
    formData,
    {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    }
  );

  return response.data;
}

/**
 * Delete image from Cloudinary using signed request
 *
 * @param publicId - Public ID of the image to delete
 * @returns Deletion result
 */
export async function deleteImage(publicId: string): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000);

  const signatureData = await getSignature({
    timestamp,
    public_id: publicId
  });

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', signatureData.api_key);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('signature', signatureData.signature);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/destroy`,
    formData
  );

  return response.data;
}

/**
 * Example: Upload with eager transformations
 */
export async function uploadWithEagerTransformations(
  file: File | Blob,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<any> {
  return uploadWithSignature({
    file,
    folder,
    eager: 'w_400,h_400,c_fill,g_auto,q_auto:good,f_auto|w_800,h_600,c_fill,g_auto,q_auto:good,f_auto',
    onProgress
  });
}

/**
 * Example: Upload profile image with specific transformations
 */
export async function uploadProfileImage(
  file: File | Blob,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  return uploadWithSignature({
    file,
    folder: 'profiles',
    publicId: `profile_${userId}`,
    transformation: 'w_400,h_400,c_fill,g_face,q_auto:good,f_auto',
    eager: 'w_200,h_200,c_thumb,g_face,r_max,q_auto:good,f_auto',
    onProgress
  });
}
