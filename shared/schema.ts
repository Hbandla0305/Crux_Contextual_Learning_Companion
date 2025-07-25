import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const learningContent = pgTable("learning_content", {
  id: serial("id").primaryKey(),
  originalContent: text("original_content").notNull(),
  contentType: text("content_type").notNull(), // 'text', 'url', 'youtube', 'pdf'
  complexityLevel: integer("complexity_level").default(3), // 1=beginner, 2=intermediate, 3=advanced, 4=expert, 5=academic
  summary: text("summary"),
  flashcards: json("flashcards").$type<Array<{question: string, answer: string}>>(),
  quiz: json("quiz").$type<Array<{question: string, options: string[], correctAnswer: number, explanation: string}>>(),
  mindMap: json("mind_map").$type<{centralTopic: string, branches: Array<{topic: string, subtopics: string[]}>}>(),
  learningPath: json("learning_path").$type<LearningPath>(),
  additionalResources: json("additional_resources").$type<AdditionalResource[]>(),
  keyTerms: json("key_terms").$type<KeyTerm[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLearningContentSchema = createInsertSchema(learningContent).pick({
  originalContent: true,
  contentType: true,
  complexityLevel: true,
});

export type InsertLearningContent = z.infer<typeof insertLearningContentSchema>;
export type LearningContent = typeof learningContent.$inferSelect;
export type Flashcard = {question: string, answer: string};
export type QuizQuestion = {question: string, options: string[], correctAnswer: number, explanation: string};
export type MindMapData = {centralTopic: string, branches: Array<{topic: string, subtopics: string[]}>};

// New types for enhanced features
export type LearningStep = {
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: number;
  resources: string[];
  completed?: boolean;
};

export type LearningPath = {
  currentTopic: string;
  prerequisiteTopics: string[];
  nextTopics: string[];
  recommendedSteps: LearningStep[];
  skillLevel: string;
  totalEstimatedTime: string;
};

export type AdditionalResource = {
  title: string;
  type: 'article' | 'video' | 'book' | 'course' | 'tutorial' | 'documentation';
  url: string;
  description: string;
  difficulty: number;
  estimatedTime?: string;
  rating?: number;
};

export type KeyTerm = {
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  examples: string[];
  complexity: number;
};
