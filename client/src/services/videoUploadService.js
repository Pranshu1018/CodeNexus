/**
 * Video Upload Service using Cloudinary
 * Handles video file uploads to cloud storage
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

/**
 * Upload video file to Cloudinary
 * @param {File} file - Video file to upload
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export const uploadVideo = async (file, onProgress = null) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 100MB for free tier)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('Video file is too large. Maximum size is 100MB.');
    }

    // Check file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload MP4, WebM, OGG, or MOV files.');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'codenexus/courses');
    formData.append('resource_type', 'video');

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded / e.total) * 100);
            onProgress(percentage);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            duration: response.duration,
            format: response.format,
            width: response.width,
            height: response.height,
            size: response.bytes,
            thumbnail: response.secure_url.replace(/\.[^.]+$/, '.jpg'),
            createdAt: response.created_at
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.open('POST', CLOUDINARY_UPLOAD_URL);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Upload thumbnail image to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadThumbnail = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Image file is too large. Maximum size is 10MB.');
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'codenexus/thumbnails');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload thumbnail');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    throw error;
  }
};

/**
 * Delete video from Cloudinary (requires backend)
 * Note: This is a placeholder - actual deletion requires server-side API call
 */
export const deleteVideo = async (publicId) => {
  console.warn('Video deletion requires backend implementation with API secret');
  // This would need to be implemented on your backend
  // as it requires the API secret which shouldn't be exposed in frontend
  return { message: 'Deletion requires backend implementation' };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format duration from seconds to HH:MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Validate video file before upload
 */
export const validateVideoFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return errors;
  }
  
  // Check size
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    errors.push('File size exceeds 100MB limit');
  }
  
  // Check type
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (!validTypes.includes(file.type)) {
    errors.push('Invalid file type. Use MP4, WebM, OGG, or MOV');
  }
  
  return errors;
};

/**
 * Get video thumbnail from Cloudinary URL
 */
export const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl) return null;
  
  // Cloudinary video URLs can be converted to thumbnail by changing extension
  if (videoUrl.includes('cloudinary.com')) {
    return videoUrl.replace(/\.[^.]+$/, '.jpg');
  }
  
  return null;
};
