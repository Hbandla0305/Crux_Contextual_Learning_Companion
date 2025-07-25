import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const onboardingSteps = [
  {
    title: "Welcome to Learning Companion! 🎓",
    description: "Transform any content into comprehensive learning materials with AI",
    features: [
      "Smart summaries from text, URLs, or YouTube videos",
      "Interactive flashcards with progress tracking", 
      "Adaptive quizzes with explanations",
      "Visual mind maps for better understanding"
    ]
  },
  {
    title: "Content Input Options 📝",
    description: "Multiple ways to add content for learning",
    features: [
      "Paste text directly into the main input area",
      "Enter any website URL for automatic content extraction",
      "Upload .txt files via drag & drop or file picker",
      "YouTube video URLs for transcript processing"
    ]
  },
  {
    title: "Adaptive Learning Difficulty 🎯", 
    description: "Customize content complexity to match your level",
    features: [
      "Beginner: Simple language, basic concepts",
      "Intermediate: Clear explanations with technical terms",
      "Advanced: Professional terminology, deeper analysis", 
      "Expert: Sophisticated concepts, critical thinking",
      "Academic: Scholarly language, theoretical frameworks"
    ]
  },
  {
    title: "Study Tools & Export 📚",
    description: "Interactive tools to enhance your learning",
    features: [
      "Flip flashcards and mark as mastered/review",
      "Take quizzes with instant feedback",
      "Download mind maps as PNG images", 
      "Export to PDF or Anki-compatible CSV files"
    ]
  }
];

interface OnboardingGuideProps {
  onComplete?: () => void;
}

export default function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useLocalStorage("hasSeenOnboarding", false);
  const [isOpen, setIsOpen] = useState(!hasSeenGuide);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHasSeenGuide(true);
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setHasSeenGuide(true);
    setIsOpen(false);
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <>
      {/* Guide button for users who want to see it again */}
      {hasSeenGuide && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentStep(0);
            setIsOpen(true);
          }}
          className="fixed bottom-4 right-4 z-50 bg-white shadow-lg"
        >
          <i className="fas fa-question-circle mr-2"></i>
          Help
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {currentStepData.title}
              </DialogTitle>
              <Badge variant="secondary">
                {currentStep + 1} of {onboardingSteps.length}
              </Badge>
            </div>
            <DialogDescription className="text-base">
              {currentStepData.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {currentStepData.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Progress indicator */}
            <div className="flex space-x-2 justify-center">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="space-x-2">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
                <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
                  Skip Guide
                </Button>
              </div>

              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                {currentStep === onboardingSteps.length - 1 ? 'Get Started!' : 'Next'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}