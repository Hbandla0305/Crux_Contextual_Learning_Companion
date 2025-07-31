import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { LearningPath as LearningPathType } from "@shared/schema";

interface LearningPathProps {
  learningPath: LearningPathType;
}

export default function LearningPath({ learningPath }: LearningPathProps) {
  if (!learningPath || !learningPath.currentTopic) {
    return null;
  }

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-blue-100 text-blue-800", 
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800"
    };
    return colors[difficulty as keyof typeof colors] || colors[3];
  };

  return (
    <section id="learning-path" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-lg border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center text-purple-700">
            <i className="fas fa-route mr-3 text-xl"></i>
            Your Personalized Learning Path
          </CardTitle>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {learningPath.skillLevel}
            </Badge>
            <span className="text-sm text-gray-600">
              <i className="fas fa-clock mr-1"></i>
              Total time: {learningPath.totalEstimatedTime}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Current Topic */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">
                <i className="fas fa-target mr-2"></i>
                Current Focus: {learningPath.currentTopic}
              </h3>
            </div>

            {/* Prerequisites */}
            {learningPath.prerequisiteTopics && learningPath.prerequisiteTopics.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  <i className="fas fa-arrow-left mr-2 text-gray-600"></i>
                  Prerequisites
                </h4>
                <div className="flex flex-wrap gap-2">
                  {learningPath.prerequisiteTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="border-gray-300">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Steps */}
            {learningPath.recommendedSteps && learningPath.recommendedSteps.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  <i className="fas fa-list-ol mr-2 text-purple-600"></i>
                  Recommended Study Steps
                </h4>
                <div className="space-y-4">
                  {learningPath.recommendedSteps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <h5 className="font-medium text-gray-900">{step.title}</h5>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(step.difficulty)}>
                            Level {step.difficulty}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            <i className="fas fa-clock mr-1"></i>
                            {step.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 ml-11">{step.description}</p>
                      
                      {step.resources && step.resources.length > 0 && (
                        <div className="ml-11">
                          <p className="text-sm font-medium text-gray-700 mb-2">Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((resource, resourceIndex) => (
                              <Badge key={resourceIndex} variant="secondary" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Topics */}
            {learningPath.nextTopics && learningPath.nextTopics.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  <i className="fas fa-arrow-right mr-2 text-green-600"></i>
                  What to Learn Next
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningPath.nextTopics.map((topic, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <span className="text-green-800 font-medium">{topic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </CardContent>
      </Card>
    </section>
  );
}