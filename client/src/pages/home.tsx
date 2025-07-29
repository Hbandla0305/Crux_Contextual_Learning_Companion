import { useState } from "react";
import Navigation from "@/components/Navigation";
import ContentInput from "@/components/ContentInput";
import Summary from "@/components/Summary";
import Flashcards from "@/components/Flashcards";
import Quiz from "@/components/Quiz";
import MindMap from "@/components/MindMap";
import ExportSection from "@/components/ExportSection";
import OnboardingGuide from "@/components/OnboardingGuide";
import LearningPath from "@/components/LearningPath";
import AdditionalResources from "@/components/AdditionalResources";
import KeyTerms from "@/components/KeyTerms";
import { Card, CardContent } from "@/components/ui/card";
import type { LearningContent } from "@shared/schema";

export default function Home() {
  const [learningData, setLearningData] = useState<LearningContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContentProcessed = (data: LearningContent) => {
    setLearningData(data);
    // Smooth scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById("summary");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <OnboardingGuide />
      
      <ContentInput 
        onContentProcessed={handleContentProcessed}
        setIsLoading={setIsLoading}
      />

      {/* Loading State */}
      {isLoading && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Learning Toolkit</h3>
              <p className="text-gray-600">Hang tight, we're analyzing your content and generating personalized learning materials...</p>
              <div className="mt-6 bg-gray-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full animate-pulse" style={{ width: "65%" }}></div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Results Section */}
      {learningData && !isLoading && (
        <>
          {/* Success Message */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-white"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Here's your comprehensive learning kit!</h3>
                  <p className="text-gray-600">Your content has been transformed into 7 powerful learning tools including personalized paths and curated resources.</p>
                </div>
              </div>
            </div>
          </section>

          <Summary summary={learningData.summary || ""} />
          <LearningPath learningPath={learningData.learningPath || { currentTopic: "", prerequisiteTopics: [], nextTopics: [], recommendedSteps: [], skillLevel: "", totalEstimatedTime: "" }} />
          <KeyTerms keyTerms={learningData.keyTerms || []} />
          <Flashcards flashcards={learningData.flashcards || []} />
          <Quiz quiz={learningData.quiz || []} />
          <MindMap mindMap={learningData.mindMap || { centralTopic: "", branches: [] }} />
          <AdditionalResources resources={learningData.additionalResources || []} />
          <ExportSection data={learningData} />
        </>
      )}

      {/* Privacy Notice */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <i className="fas fa-shield-alt text-green-600"></i>
            <span className="font-semibold text-gray-900">Privacy Protected</span>
          </div>
          <p className="text-sm text-gray-600">
            All content processed securely via OpenAI. No data is stored on our servers. Your learning materials stay private.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            Built by{" "}
            <a 
              href="https://hrudvibandla.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Hrudvi Bandla
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
