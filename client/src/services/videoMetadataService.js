/**
 * Video Metadata Extraction Service
 * Extracts metadata from YouTube, Vimeo, and other video URLs
 */

/**
 * Extract video ID from YouTube URL
 */
const getYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Extract video ID from Vimeo URL
 */
const getVimeoVideoId = (url) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

/**
 * Fetch YouTube video metadata using oEmbed API (no API key required)
 */
export const fetchYouTubeMetadata = async (url) => {
  try {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    // Use YouTube oEmbed API (no API key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) throw new Error('Failed to fetch YouTube metadata');
    
    const data = await response.json();
    
    return {
      platform: 'youtube',
      videoId,
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      // Note: oEmbed doesn't provide duration, we'll estimate from other sources
      duration: null,
      description: null
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    throw error;
  }
};

/**
 * Fetch Vimeo video metadata using oEmbed API
 */
export const fetchVimeoMetadata = async (url) => {
  try {
    const videoId = getVimeoVideoId(url);
    if (!videoId) throw new Error('Invalid Vimeo URL');

    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) throw new Error('Failed to fetch Vimeo metadata');
    
    const data = await response.json();
    
    return {
      platform: 'vimeo',
      videoId,
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      watchUrl: `https://vimeo.com/${videoId}`,
      duration: data.duration || null,
      description: data.description || null
    };
  } catch (error) {
    console.error('Error fetching Vimeo metadata:', error);
    throw error;
  }
};

/**
 * Detect video platform from URL
 */
export const detectVideoPlatform = (url) => {
  if (!url) return null;
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  } else if (url.includes('drive.google.com')) {
    return 'google-drive';
  } else if (url.includes('dropbox.com')) {
    return 'dropbox';
  }
  
  return 'other';
};

/**
 * Extract metadata from any supported video URL
 */
export const extractVideoMetadata = async (url) => {
  const platform = detectVideoPlatform(url);
  
  try {
    switch (platform) {
      case 'youtube':
        return await fetchYouTubeMetadata(url);
      
      case 'vimeo':
        return await fetchVimeoMetadata(url);
      
      case 'google-drive':
      case 'dropbox':
      case 'other':
        // For other platforms, return basic info
        return {
          platform,
          url,
          title: null,
          author: null,
          thumbnail: null,
          embedUrl: url,
          watchUrl: url,
          duration: null,
          description: null
        };
      
      default:
        throw new Error('Unsupported video platform');
    }
  } catch (error) {
    console.error('Error extracting video metadata:', error);
    // Return basic info even if extraction fails
    return {
      platform: platform || 'unknown',
      url,
      title: null,
      author: null,
      thumbnail: null,
      embedUrl: url,
      watchUrl: url,
      duration: null,
      description: null,
      error: error.message
    };
  }
};

/**
 * Batch extract metadata for multiple videos
 */
export const extractMultipleVideoMetadata = async (videos) => {
  const promises = videos.map(video => 
    extractVideoMetadata(video.url).then(metadata => ({
      ...video,
      metadata
    }))
  );
  
  return await Promise.all(promises);
};

/**
 * Validate video URL format
 */
export const isValidVideoUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    const platform = detectVideoPlatform(url);
    return platform !== null;
  } catch {
    return false;
  }
};

/**
 * Format duration from seconds to HH:MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds) return 'Unknown';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
