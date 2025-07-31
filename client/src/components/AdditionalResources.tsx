import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdditionalResource } from "@shared/schema";

interface AdditionalResourcesProps {
  resources: AdditionalResource[];
}

export default function AdditionalResources({ resources }: AdditionalResourcesProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  const getResourceIcon = (type: string) => {
    const icons = {
      article: "fas fa-newspaper",
      video: "fas fa-play-circle", 
      book: "fas fa-book",
      course: "fas fa-graduation-cap",
      tutorial: "fas fa-code",
      documentation: "fas fa-file-text",
      guide: "fas fa-map",
      'api-reference': "fas fa-code-branch",
      example: "fas fa-lightbulb"
    };
    return icons[type as keyof typeof icons] || "fas fa-link";
  };

  const getResourceColor = (type: string) => {
    const colors = {
      article: "bg-blue-100 text-blue-800",
      video: "bg-red-100 text-red-800",
      book: "bg-green-100 text-green-800", 
      course: "bg-purple-100 text-purple-800",
      tutorial: "bg-orange-100 text-orange-800",
      documentation: "bg-gray-100 text-gray-800",
      guide: "bg-teal-100 text-teal-800",
      'api-reference': "bg-indigo-100 text-indigo-800",
      example: "bg-yellow-100 text-yellow-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i 
        key={i} 
        className={`fas fa-star ${i < difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
      ></i>
    ));
  };

  return (
    <section id="additional-resources" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center text-blue-700">
            <i className="fas fa-external-link-alt mr-3 text-xl"></i>
            Additional Learning Resources
            <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-800">
              {resources.length} resources
            </Badge>
          </CardTitle>
          <p className="text-blue-600 mt-2">
            Intelligent resource discovery powered by AI to find the most relevant learning materials
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <i className={`${getResourceIcon(resource.type)} text-lg text-gray-600`}></i>
                    <Badge className={getResourceColor(resource.type)}>
                      {resource.type.replace('-', ' ')}
                    </Badge>
                    {resource.source && (
                      <Badge variant="outline" className="text-xs bg-gray-50">
                        {resource.source}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {getDifficultyStars(resource.difficulty)}
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {resource.title}
                </h4>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {resource.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {resource.estimatedTime && (
                      <span>
                        <i className="fas fa-clock mr-1"></i>
                        {resource.estimatedTime}
                      </span>
                    )}
                    {resource.rating && (
                      <span className="flex items-center">
                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                        {resource.rating}
                      </span>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <i className="fas fa-external-link-alt mr-1"></i>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center mb-2">
              <i className="fas fa-lightbulb text-blue-600 mr-2"></i>
              <span className="font-medium text-blue-900">Pro Tip</span>
            </div>
            <p className="text-blue-700 text-sm">
              Start with resources that match your current difficulty level, then gradually progress to more challenging materials. 
              Mix different resource types (videos, articles, tutorials) for a well-rounded learning experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}