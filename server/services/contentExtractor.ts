export function detectContentType(input: string): 'text' | 'url' | 'youtube' {
  const trimmed = input.trim();
  
  // Check for YouTube URLs
  const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
  if (youtubePattern.test(trimmed)) {
    return 'youtube';
  }
  
  // Check for general URLs
  const urlPattern = /^https?:\/\/.+/;
  if (urlPattern.test(trimmed)) {
    return 'url';
  }
  
  return 'text';
}

export async function extractContent(input: string, type: string): Promise<string> {
  switch (type) {
    case 'text':
      return input;
    
    case 'youtube':
      // For now, return placeholder - in production would use YouTube API or transcript service
      throw new Error('YouTube transcript extraction not yet implemented. Please paste the transcript text directly.');
    
    case 'url':
      // For now, return placeholder - in production would use content extraction service
      throw new Error('URL content extraction not yet implemented. Please copy and paste the article text directly.');
    
    default:
      return input;
  }
}

export function validateContent(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Content cannot be empty' };
  }
  
  if (content.length > 20000) {
    return { isValid: false, error: 'Content must be less than 20,000 characters' };
  }
  
  return { isValid: true };
}
