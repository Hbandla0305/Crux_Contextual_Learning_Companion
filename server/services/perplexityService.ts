import axios from 'axios';

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
}

interface LearningResource {
  title: string;
  url: string;
  description: string;
  type: 'documentation' | 'guide' | 'api-reference' | 'tutorial' | 'example' | 'article' | 'video' | 'course';
  difficulty: number;
  estimatedTime: string;
  rating: number;
  source: string;
}

export async function findLearningResources(topic: string, complexityLevel: number = 3): Promise<LearningResource[]> {
  try {
    const complexityPrompts = {
      1: "beginner-friendly introductory tutorials, basic guides, and getting started documentation",
      2: "intermediate tutorials, practical guides, and comprehensive documentation with examples", 
      3: "advanced tutorials, in-depth guides, API documentation, and professional resources",
      4: "expert-level documentation, advanced implementation guides, and specialized resources",
      5: "academic papers, research documentation, and cutting-edge technical resources"
    };

    const difficultyPrompt = complexityPrompts[complexityLevel as keyof typeof complexityPrompts] || complexityPrompts[3];

    const searchQuery = `Find ${difficultyPrompt} for learning about ${topic}. Look for official documentation, comprehensive tutorials, practical guides, examples, and educational resources from authoritative sources.`;

    const response = await axios.post<PerplexityResponse>(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an expert at finding educational resources. Search for high-quality learning materials and respond with useful URLs and information. Focus on finding real, actionable resources from authoritative sources. Be precise and concise.`
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('No content returned from Perplexity API');
    }

    const content = response.data.choices[0].message.content;
    
    // Try to parse JSON from the response
    let resources: any[] = [];
    try {
      // Look for JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        resources = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, try parsing the entire content
        resources = JSON.parse(content);
      }
    } catch (parseError) {
      // If JSON parsing fails, extract URLs and create resources from citations
      console.log('JSON parsing failed, extracting from citations and content');
      resources = extractResourcesFromContent(content, response.data.citations || [], topic, complexityLevel);
    }

    // Ensure we have some resources from citations even if JSON parsing worked
    if ((resources.length === 0 || resources.length < 3) && response.data.citations) {
      const citationResources = extractResourcesFromContent(content, response.data.citations, topic, complexityLevel);
      resources = [...resources, ...citationResources].slice(0, 8);
    }

    // Validate and format resources
    const formattedResources: LearningResource[] = resources
      .filter(resource => resource.url && resource.title)
      .slice(0, 8)
      .map(resource => ({
        title: resource.title || 'Learning Resource',
        url: resource.url,
        description: resource.description || `Learn more about ${topic}`,
        type: validateResourceType(resource.type || 'article'),
        difficulty: Math.min(5, Math.max(1, resource.difficulty || complexityLevel)),
        estimatedTime: resource.estimatedTime || estimateReadingTime(resource.description || ''),
        rating: Math.min(5, Math.max(3, resource.rating || (4.0 + Math.random() * 0.8))),
        source: resource.source || extractDomain(resource.url)
      }));

    console.log(`Perplexity found ${formattedResources.length} learning resources for: ${topic}`);
    return formattedResources;

  } catch (error) {
    console.error('Error with Perplexity API:', error);
    
    // Log the specific error for debugging
    if (error.response) {
      console.error('Perplexity API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    // Don't throw, let the fallback system handle it
    return [];
  }
}

function extractResourcesFromContent(content: string, citations: string[], topic: string, difficulty: number): any[] {
  const resources: any[] = [];
  
  // Extract resources from citations
  citations.forEach((url, index) => {
    if (url && url.startsWith('http')) {
      const domain = extractDomain(url);
      resources.push({
        title: `${topic} Resource ${index + 1}`,
        url,
        description: `Learn about ${topic} from ${domain}`,
        type: inferResourceType(url),
        difficulty,
        estimatedTime: '10-15 mins',
        source: domain
      });
    }
  });

  // Try to extract additional URLs from content
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const contentUrls = content.match(urlRegex) || [];
  
  contentUrls.forEach((url, index) => {
    if (!citations.includes(url) && resources.length < 8) {
      const domain = extractDomain(url);
      resources.push({
        title: `${topic} Reference ${resources.length + 1}`,
        url,
        description: `Additional resource for learning ${topic}`,
        type: inferResourceType(url),
        difficulty,
        estimatedTime: '5-20 mins',
        source: domain
      });
    }
  });

  return resources;
}

function validateResourceType(type: string): LearningResource['type'] {
  const validTypes: LearningResource['type'][] = [
    'documentation', 'guide', 'api-reference', 'tutorial', 'example', 'article', 'video', 'course'
  ];
  
  const lowerType = type.toLowerCase();
  return validTypes.find(t => t === lowerType) || 'article';
}

function inferResourceType(url: string): LearningResource['type'] {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('/docs/') || lowerUrl.includes('/documentation/')) {
    return 'documentation';
  }
  if (lowerUrl.includes('/api/') || lowerUrl.includes('/reference/')) {
    return 'api-reference';
  }
  if (lowerUrl.includes('/guide') || lowerUrl.includes('/guides/')) {
    return 'guide';
  }
  if (lowerUrl.includes('/tutorial') || lowerUrl.includes('/learn/')) {
    return 'tutorial';
  }
  if (lowerUrl.includes('/example') || lowerUrl.includes('/demo')) {
    return 'example';
  }
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('vimeo.com')) {
    return 'video';
  }
  if (lowerUrl.includes('course') || lowerUrl.includes('udemy') || lowerUrl.includes('coursera')) {
    return 'course';
  }
  
  return 'article';
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'web';
  }
}

function estimateReadingTime(description: string): string {
  const wordCount = description.split(' ').length;
  const minutes = Math.max(5, Math.ceil(wordCount / 200 * 5)); // Assume 200 words per minute
  
  if (minutes <= 10) return '5-10 mins';
  if (minutes <= 20) return '10-20 mins';
  if (minutes <= 30) return '20-30 mins';
  return '30+ mins';
}

export async function searchRelatedTopics(mainTopic: string, originalUrl?: string): Promise<string[]> {
  try {
    const searchQuery = originalUrl 
      ? `What are related topics and concepts I should learn alongside ${mainTopic}? Consider the context from ${originalUrl}`
      : `What are related topics and concepts I should learn alongside ${mainTopic}?`;

    const response = await axios.post<PerplexityResponse>(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an educational expert. Provide 5-8 related topics that would help someone learning the main topic. Return only a JSON array of topic strings: ["topic1", "topic2", "topic3"]'
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        return_images: false,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const content = response.data.choices[0]?.message?.content || '[]';
    
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return Array.isArray(topics) ? topics.slice(0, 8) : [];
    } catch {
      return [];
    }

  } catch (error) {
    console.error('Error searching related topics:', error);
    return [];
  }
}