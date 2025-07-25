import { learningContent, type LearningContent, type InsertLearningContent } from "@shared/schema";

export interface IStorage {
  createLearningContent(content: InsertLearningContent): Promise<LearningContent>;
  getLearningContent(id: number): Promise<LearningContent | undefined>;
  updateLearningContent(id: number, updates: Partial<LearningContent>): Promise<LearningContent | undefined>;
}

export class MemStorage implements IStorage {
  private contents: Map<number, LearningContent>;
  private currentId: number;

  constructor() {
    this.contents = new Map();
    this.currentId = 1;
  }

  async createLearningContent(insertContent: InsertLearningContent): Promise<LearningContent> {
    const id = this.currentId++;
    const content: LearningContent = {
      ...insertContent,
      id,
      complexityLevel: insertContent.complexityLevel || 3,
      summary: null,
      flashcards: null,
      quiz: null,
      mindMap: null,
      createdAt: new Date(),
    };
    this.contents.set(id, content);
    return content;
  }

  async getLearningContent(id: number): Promise<LearningContent | undefined> {
    return this.contents.get(id);
  }

  async updateLearningContent(id: number, updates: Partial<LearningContent>): Promise<LearningContent | undefined> {
    const existing = this.contents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.contents.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
