import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLearningContentSchema } from "@shared/schema";
import { generateSummary, generateFlashcards, generateQuiz, generateMindMap } from "./services/openai";
import { detectContentType, extractContent, validateContent } from "./services/contentExtractor";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Process content and generate learning materials
  app.post("/api/process-content", async (req, res) => {
    try {
      const { content, complexityLevel = 3 } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Validate content
      const validation = validateContent(content);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      // Detect content type and extract if needed
      const contentType = detectContentType(content);
      let extractedContent: string;
      
      try {
        extractedContent = await extractContent(content, contentType);
      } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }

      // Create initial learning content record
      const learningContent = await storage.createLearningContent({
        originalContent: extractedContent,
        contentType,
        complexityLevel
      });

      // Generate AI content in parallel
      try {
        const [summary, flashcards, quiz, mindMap] = await Promise.all([
          generateSummary(extractedContent, complexityLevel),
          generateFlashcards(extractedContent, complexityLevel),
          generateQuiz(extractedContent, complexityLevel),
          generateMindMap(extractedContent, complexityLevel)
        ]);

        // Update the record with generated content
        const updatedContent = await storage.updateLearningContent(learningContent.id, {
          summary,
          flashcards,
          quiz,
          mindMap
        });

        res.json(updatedContent);
      } catch (aiError) {
        // Return the content with error message if AI generation fails
        res.status(500).json({ 
          error: "Failed to generate learning materials. Please check your OpenAI API key and try again.",
          details: aiError instanceof Error ? aiError.message : 'Unknown error',
          contentId: learningContent.id
        });
      }

    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Upload and process files
  app.post("/api/upload-file", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { originalname, path: filePath, mimetype } = req.file;
      
      // Validate file type
      if (!mimetype.includes('text') && !mimetype.includes('pdf')) {
        fs.unlinkSync(filePath); // Clean up uploaded file
        return res.status(400).json({ error: "Only PDF and TXT files are supported" });
      }

      let content: string;

      if (mimetype.includes('text')) {
        // Read text file
        content = fs.readFileSync(filePath, 'utf-8');
      } else if (mimetype.includes('pdf')) {
        // For PDF files - in production would use pdf-parse
        fs.unlinkSync(filePath); // Clean up uploaded file
        return res.status(400).json({ error: "PDF processing not yet implemented. Please copy and paste the text content." });
      } else {
        fs.unlinkSync(filePath); // Clean up uploaded file
        return res.status(400).json({ error: "Unsupported file type" });
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      // Validate content
      const validation = validateContent(content);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      // Process the content same as text input
      const learningContent = await storage.createLearningContent({
        originalContent: content,
        contentType: 'text'
      });

      try {
        const [summary, flashcards, quiz, mindMap] = await Promise.all([
          generateSummary(content),
          generateFlashcards(content),
          generateQuiz(content),
          generateMindMap(content)
        ]);

        const updatedContent = await storage.updateLearningContent(learningContent.id, {
          summary,
          flashcards,
          quiz,
          mindMap
        });

        res.json(updatedContent);
      } catch (aiError) {
        res.status(500).json({ 
          error: "Failed to generate learning materials. Please check your OpenAI API key and try again.",
          details: aiError instanceof Error ? aiError.message : 'Unknown error',
          contentId: learningContent.id
        });
      }

    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get learning content by ID
  app.get("/api/content/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getLearningContent(id);
      
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
