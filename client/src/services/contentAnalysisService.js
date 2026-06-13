/**
 * AI-Powered Content Analysis Service
 * Analyzes course content for quality, relevance, and completeness
 */

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Simple word overlap calculation
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

/**
 * Extract keywords from text
 */
const extractKeywords = (text) => {
  if (!text) return [];
  
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Count word frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

/**
 * Check if course has all required sections
 * IMPROVED: More lenient scoring for better user experience
 */
const checkCourseCompleteness = (course) => {
  const issues = [];
  const suggestions = [];
  let score = 100;
  
  // Check basic fields (critical - deduct more)
  if (!course.title || course.title.length < 5) {
    issues.push('Course title is missing or too short');
    suggestions.push('Provide a descriptive title (at least 5 characters)');
    score -= 20;
  } else if (course.title.length < 10) {
    suggestions.push('Consider a more descriptive title (10+ characters recommended)');
    score -= 5;
  }
  
  if (!course.description || course.description.length < 20) {
    issues.push('Course description is missing or too short');
    suggestions.push('Add a description (at least 20 characters)');
    score -= 15;
  } else if (course.description.length < 50) {
    suggestions.push('Add more details to description (50+ characters recommended)');
    score -= 5;
  }
  
  if (!course.category) {
    issues.push('Course category is missing');
    suggestions.push('Select an appropriate category');
    score -= 10;
  }
  
  // Videos check (most important)
  if (!course.videos || course.videos.length === 0) {
    issues.push('No videos added');
    suggestions.push('Add at least one video to the course');
    score -= 30;
  } else if (course.videos.length === 1) {
    suggestions.push('Add more videos for a better course (3+ videos recommended)');
    score -= 5;
  }
  
  // Thumbnail check (nice to have)
  if (!course.thumbnail || course.thumbnail === '/placeholder.svg') {
    suggestions.push('Upload a custom course thumbnail for better visibility');
    score -= 5;
  }
  
  // Price check
  if (!course.price || course.price <= 0) {
    suggestions.push('Set a reasonable price for your course');
    score -= 5;
  }
  
  return { 
    issues, 
    suggestions, 
    isComplete: issues.length === 0,
    score: Math.max(0, score)
  };
};

/**
 * Analyze topic alignment between course and videos
 * IMPROVED: More realistic scoring, gives benefit of doubt
 */
const analyzeTopicAlignment = (course, videosWithMetadata) => {
  // If no videos, return base score
  if (!videosWithMetadata || videosWithMetadata.length === 0) {
    return {
      averageAlignment: 50,
      videoAlignments: [],
      courseKeywords: []
    };
  }

  const courseKeywords = extractKeywords(
    `${course.title} ${course.description} ${course.category}`
  );
  
  // If we can't extract keywords, assume good alignment
  if (courseKeywords.length === 0) {
    return {
      averageAlignment: 75,
      videoAlignments: videosWithMetadata.map(v => ({
        videoTitle: v.title,
        alignment: 75,
        matchedKeywords: []
      })),
      courseKeywords: []
    };
  }
  
  let totalAlignment = 0;
  const videoAlignments = [];
  
  videosWithMetadata.forEach(video => {
    const videoText = `${video.metadata?.title || video.title} ${video.metadata?.description || video.description || ''}`;
    const videoKeywords = extractKeywords(videoText);
    
    // Calculate keyword overlap with more lenient scoring
    const overlap = courseKeywords.filter(kw => videoKeywords.includes(kw)).length;
    let alignment = courseKeywords.length > 0 ? overlap / courseKeywords.length : 0.5;
    
    // Boost alignment if video has a title (shows effort)
    if (video.title && video.title.length > 5) {
      alignment = Math.min(1, alignment + 0.2);
    }
    
    // Boost if video has description
    if (video.description && video.description.length > 10) {
      alignment = Math.min(1, alignment + 0.1);
    }
    
    // Minimum alignment of 40% if video exists
    alignment = Math.max(0.4, alignment);
    
    totalAlignment += alignment;
    videoAlignments.push({
      videoTitle: video.title,
      alignment: Math.round(alignment * 100),
      matchedKeywords: courseKeywords.filter(kw => videoKeywords.includes(kw))
    });
  });
  
  const averageAlignment = videosWithMetadata.length > 0 
    ? (totalAlignment / videosWithMetadata.length) * 100 
    : 50;
  
  return {
    averageAlignment: Math.round(averageAlignment),
    videoAlignments,
    courseKeywords
  };
};

/**
 * Check for inappropriate or spam content
 */
const checkContentQuality = (course, videosWithMetadata) => {
  const flags = [];
  
  // Spam keywords to detect
  const spamKeywords = [
    'free money', 'get rich quick', 'click here', 'buy now',
    'limited time', 'act now', 'guarantee', 'no risk'
  ];
  
  // Check course title and description
  const courseText = `${course.title} ${course.description}`.toLowerCase();
  spamKeywords.forEach(keyword => {
    if (courseText.includes(keyword)) {
      flags.push(`Potential spam keyword detected: "${keyword}"`);
    }
  });
  
  // Check for excessive capitalization
  const capsRatio = (course.title.match(/[A-Z]/g) || []).length / course.title.length;
  if (capsRatio > 0.5) {
    flags.push('Excessive capitalization in title');
  }
  
  // Check video titles
  videosWithMetadata.forEach(video => {
    const videoTitle = (video.metadata?.title || video.title || '').toLowerCase();
    spamKeywords.forEach(keyword => {
      if (videoTitle.includes(keyword)) {
        flags.push(`Spam keyword in video "${video.title}": "${keyword}"`);
      }
    });
  });
  
  return {
    hasQualityIssues: flags.length > 0,
    flags,
    qualityScore: Math.max(0, 100 - (flags.length * 20))
  };
};

/**
 * Comprehensive course analysis
 * IMPROVED: More realistic and lenient scoring
 */
export const analyzeCourseContent = async (course, videosWithMetadata) => {
  try {
    // Check completeness
    const completeness = checkCourseCompleteness(course);
    
    // Analyze topic alignment
    const alignment = analyzeTopicAlignment(course, videosWithMetadata);
    
    // Check content quality
    const quality = checkContentQuality(course, videosWithMetadata);
    
    // Use the calculated scores directly
    const completenessScore = completeness.score;
    const alignmentScore = alignment.averageAlignment;
    const qualityScore = quality.qualityScore;
    
    // IMPROVED: More balanced weighting
    // Completeness is most important (40%), then quality (35%), then alignment (25%)
    const overallScore = Math.round(
      (completenessScore * 0.40) + 
      (qualityScore * 0.35) + 
      (alignmentScore * 0.25)
    );
    
    // Determine recommendation with more lenient thresholds
    let recommendation = 'REJECT';
    let autoApprove = false;
    
    // Auto-approve if score is 70+ and no critical quality issues
    if (overallScore >= 70 && !quality.hasQualityIssues) {
      recommendation = 'AUTO_APPROVE';
      autoApprove = true;
    } 
    // Manual review if score is 50-69
    else if (overallScore >= 50) {
      recommendation = 'MANUAL_REVIEW';
    }
    // Reject if score is below 50
    else {
      recommendation = 'REJECT';
    }
    
    return {
      overallScore,
      recommendation,
      autoApprove,
      completeness: {
        score: completenessScore,
        ...completeness
      },
      alignment: {
        score: alignmentScore,
        ...alignment
      },
      quality: {
        score: qualityScore,
        ...quality
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing course content:', error);
    throw error;
  }
};

/**
 * Generate admin review summary
 */
export const generateReviewSummary = (analysisResult) => {
  const { overallScore, recommendation, completeness, alignment, quality } = analysisResult;
  
  let summary = `**Overall Score: ${overallScore}/100**\n\n`;
  
  // Completeness
  summary += `**Completeness (${completeness.score}/100)**\n`;
  if (completeness.issues.length > 0) {
    summary += `Issues:\n${completeness.issues.map(i => `- ${i}`).join('\n')}\n`;
  } else {
    summary += ` All required fields present\n`;
  }
  summary += '\n';
  
  // Topic Alignment
  summary += `**Topic Alignment (${alignment.score}/100)**\n`;
  summary += `Average video-course alignment: ${alignment.score}%\n`;
  summary += `Course keywords: ${alignment.courseKeywords.join(', ')}\n\n`;
  
  // Quality
  summary += `**Content Quality (${quality.score}/100)**\n`;
  if (quality.flags.length > 0) {
    summary += `Flags:\n${quality.flags.map(f => `- ${f}`).join('\n')}\n`;
  } else {
    summary += ` No quality issues detected\n`;
  }
  summary += '\n';
  
  // Recommendation
  summary += `**Recommendation: ${recommendation}**\n`;
  
  return summary;
};
