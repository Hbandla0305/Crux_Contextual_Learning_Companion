import axios from 'axios';

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  search_results?: Array<{
    title: string;
    url: string;
    date?: string;
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

export async function findLearningResources(topic: string, complexityLevel: number = 3, summary?: string): Promise<LearningResource[]> {
  try {
    const complexityPrompts = {
      1: "beginner-friendly introductory tutorials, basic guides, and getting started documentation",
      2: "intermediate tutorials, practical guides, and comprehensive documentation with examples", 
      3: "advanced tutorials, in-depth guides, API documentation, and professional resources",
      4: "expert-level documentation, advanced implementation guides, and specialized resources",
      5: "academic papers, research documentation, and cutting-edge technical resources"
    };

    const difficultyPrompt = complexityPrompts[complexityLevel as keyof typeof complexityPrompts] || complexityPrompts[3];

    // Create a focused search query using the topic and summary context
    const contextInfo = summary ? ` Context: ${summary.substring(0, 300)}...` : '';
    const searchQuery = `Find ${difficultyPrompt} for learning ${topic}.${contextInfo} Look for courses, tutorials, documentation, guides, and educational resources from authoritative sources. Focus on practical learning materials about ${topic}, not about video platforms or content sources.`;

    const response = await axios.post<PerplexityResponse>(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational resource curator. Find high-quality learning resources including courses, tutorials, articles, documentation, and guides. Focus on authoritative educational sources. Be precise and helpful.`
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        search_recency_filter: 'month',
        return_images: false,
        return_related_questions: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('No content returned from Perplexity API');
    }

    const content = response.data.choices[0].message.content;
    const searchResults = response.data.search_results || [];
    
    console.log(`Perplexity returned ${searchResults.length} search results for: ${topic}`);
    
    // Create resources from search results and content
    let resources: any[] = [];
    
    // First, create resources from search results
    if (searchResults.length > 0) {
      resources = searchResults.slice(0, 6).map((result, index) => ({
        title: result.title,
        url: result.url,
        description: extractDescriptionFromContent(content, result.title, topic),
        type: inferResourceType(result.url),
        difficulty: complexityLevel,
        estimatedTime: estimateReadingTime(result.title),
        rating: 4.2 + Math.random() * 0.6,
        source: extractDomain(result.url)
      }));
    }
    
    // Also try to extract additional URLs mentioned in the content
    const contentUrls = extractUrlsFromContent(content);
    contentUrls.forEach((url, index) => {
      if (resources.length < 8 && !resources.some(r => r.url === url)) {
        resources.push({
          title: `${topic} Resource ${resources.length + 1}`,
          url,
          description: `Additional learning resource about ${topic}`,
          type: inferResourceType(url),
          difficulty: complexityLevel,
          estimatedTime: '10-15 mins',
          rating: 4.0 + Math.random() * 0.7,
          source: extractDomain(url)
        });
      }
    });

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

  } catch (error: any) {
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

function extractDescriptionFromContent(content: string, title: string, topic: string): string {
  // Try to find relevant sentences in the content that mention the title or topic
  const sentences = content.split(/[.!?]+/).filter(s => s.length > 20);
  const relevantSentence = sentences.find(sentence => 
    sentence.toLowerCase().includes(title.toLowerCase().split(' ')[0]) ||
    sentence.toLowerCase().includes(topic.toLowerCase())
  );
  
  if (relevantSentence) {
    return relevantSentence.trim().substring(0, 150) + (relevantSentence.length > 150 ? '...' : '');
  }
  
  return `Comprehensive resource about ${topic} covering ${title.toLowerCase()}.`;
}

function extractUrlsFromContent(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const urls = content.match(urlRegex) || [];
  return Array.from(new Set(urls)); // Remove duplicates
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