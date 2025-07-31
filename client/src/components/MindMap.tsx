import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MindMapData } from "@shared/schema";

interface MindMapProps {
  mindMap: MindMapData;
}

export default function MindMap({ mindMap }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (!mindMap || !mindMap.centralTopic) return null;

  const handleNodeClick = (topic: string, subtopics: string[]) => {
    setSelectedNode(topic);
    alert(`Topic: ${topic}\n\nSubtopics:\n${subtopics.join('\n')}`);
  };

  // Mind map color scheme - vibrant colors for different branches
  const branchColors = [
    "#E53E3E", "#38A169", "#3182CE", "#805AD5", "#D69E2E", "#DD6B20", "#319795", "#E53E3E"
  ];

  // Calculate proper mind map positioning
  const centerX = 400;
  const centerY = 250;
  const mainBranchRadius = 120;
  const subBranchRadius = 80;

  const downloadPNG = async () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 800;
      canvas.height = 500;

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

  // Calculate main branch positions radiating from center
  const calculateMainBranchPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
    const x = centerX + mainBranchRadius * Math.cos(angle);
    const y = centerY + mainBranchRadius * Math.sin(angle);
    return { x, y, angle };
  };

  // Calculate sub-branch positions extending from main branches
  const calculateSubBranchPosition = (branchX: number, branchY: number, subIndex: number, subTotal: number, branchAngle: number) => {
    const baseAngle = branchAngle;
    const spread = Math.PI / 3; // 60 degrees spread
    const angle = baseAngle + (subIndex - (subTotal - 1) / 2) * (spread / (subTotal || 1));
    const x = branchX + subBranchRadius * Math.cos(angle);
    const y = branchY + subBranchRadius * Math.sin(angle);
    return { x, y };
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

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 min-h-96 relative overflow-hidden">
            <svg
              ref={svgRef}
              className="w-full h-96"
              viewBox="0 0 800 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Define curved line markers */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto" fill="#374151">
                  <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
              </defs>

              {/* Central Topic - The core of the mind map */}
              <g className="central-topic">
                <circle 
                  cx={centerX} 
                  cy={centerY} 
                  r="60" 
                  fill="#2D3748" 
                  stroke="#1A202C" 
                  strokeWidth="4"
                  className="drop-shadow-lg"
                />
                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {mindMap.centralTopic.length > 16 
                    ? mindMap.centralTopic.substring(0, 16) + "..."
                    : mindMap.centralTopic
                  }
                </text>
              </g>

              {/* Main Branches radiating from center */}
              {mindMap.branches.map((branch, branchIndex) => {
                const branchPosition = calculateMainBranchPosition(branchIndex, mindMap.branches.length);
                const branchColor = branchColors[branchIndex % branchColors.length];

                return (
                  <g key={branchIndex} className="main-branch">
                    {/* Curved main branch line */}
                    <path
                      d={`M ${centerX} ${centerY} Q ${(centerX + branchPosition.x) / 2} ${(centerY + branchPosition.y) / 2} ${branchPosition.x} ${branchPosition.y}`}
                      stroke={branchColor}
                      strokeWidth="6"
                      fill="none"
                      className="branch-line"
                    />
                    
                    {/* Main branch node */}
                    <ellipse
                      cx={branchPosition.x}
                      cy={branchPosition.y}
                      rx="50"
                      ry="25"
                      fill={branchColor}
                      stroke="#fff"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-90 transition-all duration-200 drop-shadow-md"
                      onClick={() => handleNodeClick(branch.topic, branch.subtopics)}
                    />
                    
                    {/* Main branch text */}
                    <text
                      x={branchPosition.x}
                      y={branchPosition.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      className="cursor-pointer pointer-events-none"
                    >
                      {branch.topic.length > 12 
                        ? branch.topic.substring(0, 12) + "..."
                        : branch.topic
                      }
                    </text>

                    {/* Sub-branches extending from main branches */}
                    {branch.subtopics.slice(0, 3).map((subtopic, subIndex) => {
                      const subPosition = calculateSubBranchPosition(
                        branchPosition.x, 
                        branchPosition.y, 
                        subIndex, 
                        Math.min(branch.subtopics.length, 3),
                        branchPosition.angle
                      );
                      
                      return (
                        <g key={subIndex} className="sub-branch">
                          {/* Sub-branch line */}
                          <line
                            x1={branchPosition.x}
                            y1={branchPosition.y}
                            x2={subPosition.x}
                            y2={subPosition.y}
                            stroke={branchColor}
                            strokeWidth="3"
                            strokeOpacity="0.7"
                          />
                          
                          {/* Sub-branch node */}
                          <circle
                            cx={subPosition.x}
                            cy={subPosition.y}
                            r="20"
                            fill="#fff"
                            stroke={branchColor}
                            strokeWidth="2"
                            className="cursor-pointer hover:scale-110 transition-transform duration-200"
                            onClick={() => alert(`Subtopic: ${subtopic}`)}
                          />
                          
                          {/* Sub-branch text */}
                          <text
                            x={subPosition.x}
                            y={subPosition.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={branchColor}
                            fontSize="9"
                            fontWeight="600"
                            className="pointer-events-none"
                          >
                            {subtopic.length > 8 
                              ? subtopic.substring(0, 8) + "..."
                              : subtopic
                            }
                          </text>
                        </g>
                      );
                    })}
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
