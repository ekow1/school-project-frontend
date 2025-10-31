import { ENV } from '../config/env';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

// Cloudinary configuration
const CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: ENV.CLOUDINARY_CLOUD_NAME,
  uploadPreset: ENV.CLOUDINARY_UPLOAD_PRESET,
};

/**
 * Upload an image to Cloudinary
 * @param imageUri - The local URI of the image to upload
 * @param folder - Optional folder name in Cloudinary (e.g., 'profile-pictures')
 * @returns The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = 'profile-pictures'
): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);

    // Append upload preset
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    // Append folder
    formData.append('folder', folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data: CloudinaryUploadResponse = await response.json();
    
    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
  }
};

/**
 * Delete an image from Cloudinary (requires backend implementation)
 * @param publicId - The public ID of the image to delete
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: Deleting images requires authentication and should be done from the backend
  // This is a placeholder for future backend implementation
  console.log('Delete image with public_id:', publicId);
  // You'll need to call your backend API to delete the image
};

/**
 * Extract public_id from Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public_id
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const matches = url.match(/\/([^\/]+)\.[^.]+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

