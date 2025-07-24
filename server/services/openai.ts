import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateSummary(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating clear, concise summaries. Create a 2-paragraph summary that captures the key points and main ideas in plain, accessible English."
        },
        {
          role: "user",
          content: `Please summarize this text in exactly 2 paragraphs using plain, clear English:\n\n${content}`
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

export async function generateFlashcards(content: string): Promise<Array<{question: string, answer: string}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating educational flashcards. Generate 5-10 question-answer pairs that help learners memorize key concepts. Use simple, clear language. Respond with JSON in this format: {\"flashcards\": [{\"question\": \"...\", \"answer\": \"...\"}]}"
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
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
}

export async function generateQuiz(content: string): Promise<Array<{question: string, options: string[], correctAnswer: number, explanation: string}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating educational quizzes. Generate exactly 5 multiple-choice questions with 4 options each. Mark the correct answer index (0-3) and provide brief explanations. Respond with JSON in this format: {\"questions\": [{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": 1, \"explanation\": \"...\"}]}"
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
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

export async function generateMindMap(content: string): Promise<{centralTopic: string, branches: Array<{topic: string, subtopics: string[]}> }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating mind maps. Create a mind map with one central concept and 5-8 main branches, each with 1-3 subtopics. Keep topics concise (1-3 words). Respond with JSON in this format: {\"centralTopic\": \"Main Topic\", \"branches\": [{\"topic\": \"Branch Name\", \"subtopics\": [\"Subtopic 1\", \"Subtopic 2\"]}]}"
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
    throw new Error(`Failed to generate mind map: ${error.message}`);
  }
}
