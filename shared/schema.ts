import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const learningContent = pgTable("learning_content", {
  id: serial("id").primaryKey(),
  originalContent: text("original_content").notNull(),
  contentType: text("content_type").notNull(), // 'text', 'url', 'youtube', 'pdf'
  summary: text("summary"),
  flashcards: json("flashcards").$type<Array<{question: string, answer: string}>>(),
  quiz: json("quiz").$type<Array<{question: string, options: string[], correctAnswer: number, explanation: string}>>(),
  mindMap: json("mind_map").$type<{centralTopic: string, branches: Array<{topic: string, subtopics: string[]}>}>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLearningContentSchema = createInsertSchema(learningContent).pick({
  originalContent: true,
  contentType: true,
});

export type InsertLearningContent = z.infer<typeof insertLearningContentSchema>;
export type LearningContent = typeof learningContent.$inferSelect;
export type Flashcard = {question: string, answer: string};
export type QuizQuestion = {question: string, options: string[], correctAnswer: number, explanation: string};
export type MindMapData = {centralTopic: string, branches: Array<{topic: string, subtopics: string[]}>};
