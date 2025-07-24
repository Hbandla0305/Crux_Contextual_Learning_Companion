import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@shared/schema";

interface QuizProps {
  quiz: QuizQuestion[];
}

export default function Quiz({ quiz }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const currentQ = quiz[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    if (!showFeedback) {
      setShowFeedback(true);
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedAnswer;
      setAnswers(newAnswers);
    } else {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setIsComplete(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] ?? null);
      setShowFeedback(false);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
    setIsComplete(false);
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === quiz[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  if (isComplete) {
    const score = calculateScore();
    return (
      <section id="quiz" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg animate-fade-in">
          <CardContent className="p-8">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trophy text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You crushed that quiz!</h3>
              <p className="text-gray-600 mb-4">
                You scored <span className="font-semibold text-primary">{score}</span> out of{" "}
                <span>{quiz.length}</span> questions correctly.
              </p>
              <Button onClick={handleRetake} className="bg-primary hover:bg-primary/90">
                <i className="fas fa-redo mr-2"></i>Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="quiz" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-lg animate-fade-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-question-circle text-accent mr-3"></i>
              Test Your Understanding
            </h2>
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {quiz.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Quiz Question */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{currentQ.question}</h3>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                let className = "flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-colors";
                
                if (showFeedback) {
                  if (index === currentQ.correctAnswer) {
                    className += " border-green-500 bg-green-50";
                  } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                    className += " border-red-500 bg-red-50";
                  }
                } else if (selectedAnswer === index) {
                  className += " border-primary bg-blue-50";
                } else {
                  className += " hover:border-primary";
                }

                return (
                  <label key={index} className={className} onClick={() => handleAnswerSelect(index)}>
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-4 flex items-center justify-center">
                      <div
                        className={`w-3 h-3 bg-primary rounded-full transition-opacity ${
                          selectedAnswer === index ? "opacity-100" : "opacity-0"
                        }`}
                      ></div>
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quiz Feedback */}
          {showFeedback && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <i className={`fas ${selectedAnswer === currentQ.correctAnswer ? 'fa-check' : 'fa-times'} text-white text-sm`}></i>
                </div>
                <div>
                  <p className="font-semibold text-green-800">
                    {selectedAnswer === currentQ.correctAnswer ? "Correct! Great job!" : "Not quite right."}
                  </p>
                  <p className="text-sm text-green-700">{currentQ.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              <i className="fas fa-arrow-left mr-2"></i>Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="bg-primary hover:bg-primary/90"
            >
              {showFeedback ? (
                currentQuestion === quiz.length - 1 ? (
                  "Finish Quiz"
                ) : (
                  <>
                    Next<i className="fas fa-arrow-right ml-2"></i>
                  </>
                )
              ) : (
                "Submit Answer"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
