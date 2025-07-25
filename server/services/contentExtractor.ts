import axios from 'axios';
import * as cheerio from 'cheerio';
import { Innertube } from 'youtubei.js';
import { sanitizeContent, validateSecureContent } from '../utils/sanitize';

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
  let content: string;
  
  switch (type) {
    case 'text':
      content = input;
      break;
    
    case 'youtube':
      content = await extractYouTubeTranscript(input.trim());
      break;
    
    case 'url':
      content = await extractUrlContent(input.trim());
      break;
    
    default:
      content = input;
  }

  // Sanitize all content for security
  const sanitized = sanitizeContent(content);
  
  // Validate for security
  const validation = validateSecureContent(sanitized);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  return sanitized;
}

async function extractUrlContent(url: string): Promise<string> {
  try {
    // Fetch the HTML content
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $('script, style, nav, header, footer, aside, .ads, .advertisement, .sidebar').remove();

    // Try to extract main content from common content selectors
    let content = '';
    
    // Try common article selectors first
    const articleSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.story-body',
      '.post-body'
    ];

    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length && element.text().trim().length > 200) {
        content = element.text().trim();
        break;
      }
    }

    // If no article content found, try paragraphs
    if (!content) {
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
      content = paragraphs.filter(p => p.length > 50).join('\n\n');
    }

    // Fallback to body content
    if (!content || content.length < 100) {
      content = $('body').text().trim();
    }

    // Clean up the extracted content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .trim();

    if (!content || content.length < 50) {
      throw new Error('Could not extract meaningful content from the URL. The page might be protected or have limited text content.');
    }

    // Limit content length
    if (content.length > 15000) {
      content = content.substring(0, 15000) + '...';
    }

    return content;

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('The website took too long to respond. Please try a different URL or paste the content directly.');
      } else if (error.message.includes('404') || error.message.includes('403')) {
        throw new Error('The webpage is not accessible. Please check the URL or paste the content directly.');
      } else if (error.message.includes('Could not extract')) {
        throw error; // Re-throw our custom error
      } else {
        throw new Error('Failed to extract content from the URL. Please paste the content directly.');
      }
    }
    throw new Error('Failed to extract content from the URL. Please paste the content directly.');
  }
}

async function extractYouTubeTranscript(url: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (!videoIdMatch) {
      throw new Error('Invalid YouTube URL format');
    }
    
    const videoId = videoIdMatch[1];
    
    // Initialize YouTube client
    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      enable_session_cache: false
    });
    
    // Get video info
    const videoInfo = await youtube.getInfo(videoId);
    
    if (!videoInfo) {
      throw new Error('Video not found or is private');
    }
    
    // Get transcript
    const transcriptData = await videoInfo.getTranscript();
    
    if (!transcriptData) {
      throw new Error('No transcript available for this video. Please ensure the video has captions enabled.');
    }
    
    // Extract text from transcript segments
    const transcriptText = transcriptData.transcript.content.body.initial_segments
      .map((segment: any) => segment.snippet.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!transcriptText || transcriptText.length < 50) {
      throw new Error('Transcript is too short or empty. Please paste the content directly.');
    }
    
    // Extract additional video metadata
    const title = videoInfo.basic_info.title || 'YouTube Video';
    const channel = videoInfo.basic_info.channel?.name || 'Unknown Channel';
    const duration = videoInfo.basic_info.duration?.text || 'Unknown Duration';
    const description = videoInfo.basic_info.short_description || '';
    const viewCount = videoInfo.basic_info.view_count || 0;
    const publishDate = videoInfo.basic_info.publish_date || '';
    
    // Create rich content with metadata and chapters
    let finalContent = `YouTube Video Analysis\n\n`;
    finalContent += `Title: ${title}\n`;
    finalContent += `Channel: ${channel}\n`;
    finalContent += `Duration: ${duration}\n`;
    finalContent += `Views: ${viewCount.toLocaleString()}\n`;
    if (publishDate) finalContent += `Published: ${publishDate}\n`;
    finalContent += `URL: ${url}\n\n`;
    
    // Add description if available (first 500 chars)
    if (description && description.length > 0) {
      const shortDesc = description.length > 500 ? description.substring(0, 500) + '...' : description;
      finalContent += `Description:\n${shortDesc}\n\n`;
    }
    
    // Extract chapters/timestamps if available
    const chapters = extractChapters(transcriptText);
    if (chapters.length > 0) {
      finalContent += `Key Sections:\n`;
      chapters.forEach((chapter, index) => {
        finalContent += `${index + 1}. ${chapter}\n`;
      });
      finalContent += `\n`;
    }
    
    finalContent += `Full Transcript:\n${transcriptText}`;
    
    // Limit content length
    if (finalContent.length > 20000) {
      return finalContent.substring(0, 20000) + '...';
    }
    
    return finalContent;
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('No transcript available')) {
        throw error; // Re-throw our custom error
      } else if (error.message.includes('Video not found')) {
        throw new Error('Video not found, is private, or has been removed. Please check the URL or paste the content directly.');
      } else if (error.message.includes('Invalid YouTube URL')) {
        throw error; // Re-throw our custom error
      } else {
        throw new Error('Failed to extract YouTube transcript. This may be due to regional restrictions or unavailable captions. Please paste the transcript text directly.');
      }
    }
    throw new Error('Failed to extract YouTube transcript. Please paste the content directly.');
  }
}

function extractChapters(transcript: string): string[] {
  const chapters: string[] = [];
  const lines = transcript.split('\n');
  
  // Look for common chapter indicators in transcript
  const chapterPatterns = [
    /^(\d{1,2}:\d{2})\s*-?\s*(.+)/,  // "12:34 - Chapter Title"
    /^(Chapter \d+:?\s*.+)/i,         // "Chapter 1: Introduction"
    /^(\d+\.\s*.+)/,                  // "1. Introduction"
    /^(Introduction|Conclusion|Summary|Overview)/i  // Common section names
  ];
  
  for (const line of lines) {
    for (const pattern of chapterPatterns) {
      const match = line.trim().match(pattern);
      if (match && match[0].length > 5 && match[0].length < 100) {
        chapters.push(match[0]);
        if (chapters.length >= 10) break; // Limit to 10 chapters
      }
    }
    if (chapters.length >= 10) break;
  }
  
  return chapters;
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
