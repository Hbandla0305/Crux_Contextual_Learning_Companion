import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOM window for server-side DOMPurify
const window = new JSDOM('').window;
const createDOMPurify = DOMPurify(window as any);

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes script tags, event handlers, and other dangerous elements
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';

  // Configure DOMPurify to be very strict
  const cleanContent = createDOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML tags allowed - convert everything to text
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content but remove tags
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'applet', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  });

  // Additional security: Remove any remaining script-like patterns
  const extraClean = cleanContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/&lt;script/gi, '') // Remove encoded script tags
    .replace(/&gt;/gi, '') // Clean up encoded characters
    .replace(/&lt;/gi, '')
    .trim();

  return extraClean;
}

/**
 * Validates that content doesn't contain suspicious patterns
 */
export function validateSecureContent(content: string): { isValid: boolean; error?: string } {
  if (!content) {
    return { isValid: false, error: 'Content cannot be empty' };
  }

  // Check for common XSS patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /document\.write/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return { 
        isValid: false, 
        error: 'Content contains potentially dangerous code that has been filtered for security' 
      };
    }
  }

  return { isValid: true };
}