import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface ComplexitySetting {
  level: number;
  label: string;
  description: string;
  color: string;
}

const complexitySettings: ComplexitySetting[] = [
  { level: 1, label: "Beginner", description: "Simple language, basic concepts", color: "text-green-600" },
  { level: 2, label: "Intermediate", description: "Clear explanations with some technical terms", color: "text-blue-600" },
  { level: 3, label: "Advanced", description: "Professional terminology, deeper analysis", color: "text-purple-600" },
  { level: 4, label: "Expert", description: "Sophisticated concepts, critical thinking", color: "text-orange-600" },
  { level: 5, label: "Academic", description: "Scholarly language, theoretical frameworks", color: "text-red-600" }
];

interface ComplexitySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function ComplexitySlider({ value, onChange, className = "" }: ComplexitySliderProps) {
  const currentSetting = complexitySettings.find(s => s.level === value) || complexitySettings[2];

  return (
    <Card className={`border-2 border-dashed border-gray-200 bg-gray-50/50 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Content Complexity</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${currentSetting.color}`}>
                {currentSetting.label}
              </span>
              <span className="text-xs text-gray-500">Level {value}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Slider
              value={[value]}
              onValueChange={(values) => onChange(values[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Advanced</span>
              <span>Expert</span>
              <span>Academic</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            {currentSetting.description}
          </p>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Higher complexity levels use more technical language and advanced concepts. 
              Lower levels focus on clarity and basic understanding.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}