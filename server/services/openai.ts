import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateSummary(content: string, complexityLevel: number = 3): Promise<string> {
  try {
    const complexityPrompts = {
      1: "You are creating a summary for beginners. Use very simple language, short sentences, and explain any technical terms. Create a 2-paragraph summary that is easy to understand for someone new to this topic.",
      2: "You are creating a summary for intermediate learners. Use clear language with some technical terms explained briefly. Create a 2-paragraph summary that builds understanding progressively.",
      3: "You are creating a summary for advanced learners. Use professional language and assume familiarity with basic concepts. Create a 2-paragraph summary that captures key insights.",
      4: "You are creating a summary for experts. Use precise technical language and focus on nuanced analysis. Create a 2-paragraph summary that highlights sophisticated concepts and implications.",
      5: "You are creating a summary for academic/research purposes. Use scholarly language, include theoretical frameworks, and focus on critical analysis. Create a 2-paragraph summary suitable for academic discourse."
    };

    const systemPrompt = complexityPrompts[complexityLevel as keyof typeof complexityPrompts] || complexityPrompts[3];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please summarize this text in exactly 2 paragraphs:\n\n${content}`
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateFlashcards(content: string, complexityLevel: number = 3): Promise<Array<{question: string, answer: string}>> {
  try {
    const complexityPrompts = {
      1: "Create beginner-level flashcards with simple terms and basic concepts. Focus on definitions and fundamental facts. Use everyday language.",
      2: "Create intermediate flashcards that build on basic knowledge. Include some technical terms with clear explanations. Mix facts with conceptual understanding.",
      3: "Create advanced flashcards that test deeper understanding. Include analysis, application, and connections between concepts. Use professional terminology.",
      4: "Create expert-level flashcards with sophisticated questions. Focus on nuanced distinctions, complex relationships, and critical thinking. Use precise technical language.",
      5: "Create academic-level flashcards suitable for research or graduate study. Include theoretical frameworks, methodological considerations, and scholarly analysis."
    };

    const difficultyPrompt = complexityPrompts[complexityLevel as keyof typeof complexityPrompts] || complexityPrompts[3];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating educational flashcards. ${difficultyPrompt} Generate 5-10 question-answer pairs. Respond with JSON in this format: {"flashcards": [{"question": "...", "answer": "..."}]}`
        },
        {
          role: "user",
          content: `Create flashcards from this text:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.flashcards || [];
  } catch (error) {
    throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateQuiz(content: string, complexityLevel: number = 3): Promise<Array<{question: string, options: string[], correctAnswer: number, explanation: string}>> {
  try {
    const complexityPrompts = {
      1: "Create beginner-level questions that test basic recall and simple understanding. Use straightforward language and obvious incorrect options.",
      2: "Create intermediate questions that require some analysis and understanding of relationships. Include plausible distractors.",
      3: "Create advanced questions that test application, analysis, and synthesis. Use sophisticated distractors that require careful thinking.",
      4: "Create expert-level questions that test deep understanding, critical evaluation, and complex problem-solving. Include highly plausible wrong answers.",
      5: "Create academic-level questions suitable for research or graduate study. Test theoretical understanding, methodological knowledge, and scholarly analysis."
    };

    const difficultyPrompt = complexityPrompts[complexityLevel as keyof typeof complexityPrompts] || complexityPrompts[3];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating educational quizzes. ${difficultyPrompt} Generate exactly 5 multiple-choice questions with 4 options each. Mark the correct answer index (0-3) and provide brief explanations. Respond with JSON in this format: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 1, "explanation": "..."}]}`
        },
        {
          role: "user",
          content: `Create a 5-question multiple-choice quiz from this text:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateMindMap(content: string, complexityLevel: number = 3): Promise<{centralTopic: string, branches: Array<{topic: string, subtopics: string[]}> }> {
  try {
    const complexityPrompts = {
      1: "Create a simple mind map with basic concepts and clear, simple connections. Use everyday language and fundamental topics.",
      2: "Create an intermediate mind map with some technical terms and logical groupings. Balance simplicity with detail.",
      3: "Create an advanced mind map with sophisticated categorization and professional terminology. Show complex relationships.",
      4: "Create an expert-level mind map with nuanced distinctions and specialized terminology. Focus on advanced concepts and their interconnections.",
      5: "Create an academic-level mind map suitable for research or graduate study. Include theoretical frameworks and scholarly concepts."
    };

    const difficultyPrompt = complexityPrompts[complexityLevel as keyof typeof complexityPrompts] || complexityPrompts[3];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating mind maps. ${difficultyPrompt} Create a mind map with one central concept and 5-8 main branches, each with 1-3 subtopics. Keep topics concise (1-3 words). Respond with JSON in this format: {"centralTopic": "Main Topic", "branches": [{"topic": "Branch Name", "subtopics": ["Subtopic 1", "Subtopic 2"]}]}`
        },
        {
          role: "user",
          content: `Create a mind map structure from this text:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result || { centralTopic: "Topic", branches: [] };
  } catch (error) {
    throw new Error(`Failed to generate mind map: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
