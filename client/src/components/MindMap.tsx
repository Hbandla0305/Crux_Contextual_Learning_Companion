import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MindMapData } from "@shared/schema";

interface MindMapProps {
  mindMap: MindMapData;
}

export default function MindMap({ mindMap }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!mindMap || !mindMap.centralTopic) return null;

  const colors = [
    "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#6366F1", "#84CC16"
  ];

  const downloadPNG = async () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 800;
      canvas.height = 400;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const link = document.createElement("a");
          link.download = "mind-map.png";
          link.href = canvas.toDataURL();
          link.click();
        }
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } catch (error) {
      console.error("Failed to download mind map:", error);
    }
  };

  // Calculate positions for branches in a circle around the center
  const calculateBranchPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 140;
    const centerX = 400;
    const centerY = 175;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  return (
    <section id="mindmap" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-lg animate-fade-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-project-diagram text-purple-600 mr-3"></i>
              Visual Mind Map
            </h2>
            <Button
              onClick={downloadPNG}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <i className="fas fa-download mr-2"></i>Download PNG
            </Button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 min-h-80 relative overflow-hidden">
            <svg
              ref={svgRef}
              className="w-full h-80"
              viewBox="0 0 800 350"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Central Node */}
              <g className="central-node">
                <circle cx="400" cy="175" r="50" fill="#6366F1" stroke="#4F46E5" strokeWidth="3" />
                <text
                  x="400"
                  y="175"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {mindMap.centralTopic.length > 12 
                    ? mindMap.centralTopic.substring(0, 12) + "..."
                    : mindMap.centralTopic
                  }
                </text>
              </g>

              {/* Branch Nodes */}
              {mindMap.branches.map((branch, index) => {
                const position = calculateBranchPosition(index, mindMap.branches.length);
                const color = colors[index % colors.length];

                return (
                  <g key={index} className="branch-node">
                    {/* Line to central node */}
                    <line
                      x1="400"
                      y1="175"
                      x2={position.x}
                      y2={position.y}
                      stroke={color}
                      strokeWidth="3"
                    />
                    
                    {/* Branch circle */}
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="35"
                      fill={color}
                      stroke={color}
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    
                    {/* Branch text */}
                    <text
                      x={position.x}
                      y={position.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {branch.topic.length > 8 
                        ? branch.topic.substring(0, 8) + "..."
                        : branch.topic
                      }
                    </text>
                    
                    {/* Subtopics */}
                    {branch.subtopics.slice(0, 2).map((subtopic, subIndex) => (
                      <text
                        key={subIndex}
                        x={position.x}
                        y={position.y - 60 + (subIndex * 15)}
                        textAnchor="middle"
                        fill="#374151"
                        fontSize="10"
                      >
                        {subtopic.length > 15 
                          ? subtopic.substring(0, 15) + "..."
                          : subtopic
                        }
                      </text>
                    ))}
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white bg-opacity-90 rounded-lg p-2">
              <i className="fas fa-info-circle mr-1"></i>
              Click nodes to explore
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
