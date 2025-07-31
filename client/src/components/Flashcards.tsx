import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Flashcard } from "@shared/schema";

interface FlashcardsProps {
  flashcards: Flashcard[];
}

export default function Flashcards({ flashcards }: FlashcardsProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [masteredCards, setMasteredCards] = useLocalStorage<Set<number>>("masteredCards", new Set());
  const [reviewCards, setReviewCards] = useLocalStorage<Set<number>>("reviewCards", new Set());

  if (!flashcards || flashcards.length === 0) return null;

  const flipCard = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const markMastered = (index: number) => {
    setMasteredCards(prev => new Set(Array.from(prev).concat([index])));
    setReviewCards(prev => {
      const newSet = new Set(Array.from(prev));
      newSet.delete(index);
      return newSet;
    });
  };

  const markReview = (index: number) => {
    setReviewCards(prev => new Set(Array.from(prev).concat([index])));
    setMasteredCards(prev => {
      const newSet = new Set(Array.from(prev));
      newSet.delete(index);
      return newSet;
    });
  };

  const cardColors = [
    "from-blue-50 to-indigo-50 border-blue-200",
    "from-purple-50 to-pink-50 border-purple-200",
    "from-amber-50 to-orange-50 border-amber-200",
    "from-teal-50 to-cyan-50 border-teal-200",
    "from-green-50 to-emerald-50 border-green-200",
    "from-red-50 to-rose-50 border-red-200",
    "from-gray-50 to-slate-50 border-gray-200",
    "from-yellow-50 to-amber-50 border-yellow-200",
  ];

  return (
    <section id="flashcards" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-lg animate-fade-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-layer-group text-secondary mr-3"></i>
              Flashcards to Memorize
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {masteredCards.size} / {flashcards.length} mastered
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {flashcards.map((card, index) => (
              <div
                key={index}
                className="flip-card h-80 cursor-pointer perspective-1000"
                onClick={() => flipCard(index)}
              >
                <div
                  className={`flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${
                    flippedCards.has(index) ? "rotate-y-180" : ""
                  }`}
                >
                  {/* Front */}
                  <div
                    className={`flip-card-front absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br ${
                      cardColors[index % cardColors.length]
                    } rounded-xl p-4 border flex flex-col`}
                  >
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Question
                      </span>
                      <i className="fas fa-refresh text-blue-400"></i>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <p className="text-gray-800 font-medium text-sm leading-relaxed break-words whitespace-pre-wrap">{card.question}</p>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="flip-card-back absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 rotate-y-180 flex flex-col">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Answer
                      </span>
                      <i className="fas fa-check text-green-400"></i>
                    </div>
                    <div className="flex-1 overflow-y-auto mb-3 min-h-0">
                      <p className="text-gray-800 text-sm leading-relaxed break-words whitespace-pre-wrap">{card.answer}</p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markMastered(index);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-xs"
                        disabled={masteredCards.has(index)}
                      >
                        {masteredCards.has(index) ? "Mastered!" : "Mastered"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markReview(index);
                        }}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-xs"
                        disabled={reviewCards.has(index)}
                      >
                        {reviewCards.has(index) ? "In Review" : "Review Later"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
