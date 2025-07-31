import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KeyTerm } from "@shared/schema";

interface KeyTermsProps {
  keyTerms: KeyTerm[];
}

export default function KeyTerms({ keyTerms }: KeyTermsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  if (!keyTerms || keyTerms.length === 0) {
    return null;
  }

  const categories = Array.from(new Set(keyTerms.map(term => term.category)));
  
  const filteredTerms = keyTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getComplexityColor = (complexity: number) => {
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-blue-100 text-blue-800",
      3: "bg-yellow-100 text-yellow-800", 
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800"
    };
    return colors[complexity as keyof typeof colors] || colors[3];
  };

  const toggleExpanded = (term: string) => {
    setExpandedTerm(expandedTerm === term ? null : term);
  };

  return (
    <section id="key-terms" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center text-green-700">
            <i className="fas fa-book-open mr-3 text-xl"></i>
            Key Terms & Definitions
            <Badge variant="secondary" className="ml-3 bg-green-100 text-green-800">
              {keyTerms.length} terms
            </Badge>
          </CardTitle>
          <p className="text-green-600 mt-2">
            Essential terminology and concepts explained at your learning level
          </p>
        </CardHeader>
        <CardContent className="p-8">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm" 
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTerms.map((keyTerm, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-green-300">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-lg cursor-pointer flex-1 mr-2" 
                      onClick={() => toggleExpanded(keyTerm.term)}>
                    <span className="break-words">{keyTerm.term}</span>
                    <i className={`fas fa-chevron-${expandedTerm === keyTerm.term ? 'up' : 'down'} ml-2 text-sm text-gray-500`}></i>
                  </h4>
                  <Badge className={`${getComplexityColor(keyTerm.complexity)} flex-shrink-0`}>
                    Level {keyTerm.complexity}
                  </Badge>
                </div>
                
                <Badge variant="outline" className="mb-3 text-xs">
                  {keyTerm.category}
                </Badge>
                
                <div className="text-gray-600 text-sm mb-3">
                  {expandedTerm === keyTerm.term ? (
                    <p className="whitespace-pre-wrap">{keyTerm.definition}</p>
                  ) : (
                    <p className="line-clamp-3">{keyTerm.definition}</p>
                  )}
                </div>
                
                {expandedTerm === keyTerm.term && (
                  <div className="space-y-3 border-t border-gray-200 pt-3">
                    {keyTerm.examples && keyTerm.examples.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm">Examples:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {keyTerm.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="flex items-start">
                              <i className="fas fa-circle text-xs text-green-500 mt-2 mr-2"></i>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {keyTerm.relatedTerms && keyTerm.relatedTerms.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm">Related Terms:</h5>
                        <div className="flex flex-wrap gap-1">
                          {keyTerm.relatedTerms.map((relatedTerm, relatedIndex) => (
                            <Badge key={relatedIndex} variant="secondary" className="text-xs">
                              {relatedTerm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredTerms.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No terms found matching your search criteria.</p>
            </div>
          )}
          
          <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center mb-2">
              <i className="fas fa-graduation-cap text-green-600 mr-2"></i>
              <span className="font-medium text-green-900">Study Tip</span>
            </div>
            <p className="text-green-700 text-sm">
              Click on any term to see examples and related concepts. Use the search function to quickly find specific definitions, 
              and filter by category to focus on particular areas of study.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}