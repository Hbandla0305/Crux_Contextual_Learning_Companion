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

  // Calculate main branch positions with proper spacing to avoid central overlap
  const calculateMainBranchPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
    const x = centerX + mainBranchRadius * Math.cos(angle);
    const y = centerY + mainBranchRadius * Math.sin(angle);
    return { x, y, angle };
  };

  // Calculate sub-branch positions with organic flow
  const calculateSubBranchPosition = (branchX: number, branchY: number, subIndex: number, subTotal: number, branchAngle: number) => {
    const baseAngle = branchAngle;
    const spread = Math.PI / 4; // 45 degrees spread for more natural look
    const offsetAngle = (subIndex - (subTotal - 1) / 2) * (spread / Math.max(subTotal - 1, 1));
    const angle = baseAngle + offsetAngle;
    const distance = subBranchRadius + (subIndex * 10); // Varying distances for organic feel
    const x = branchX + distance * Math.cos(angle);
    const y = branchY + distance * Math.sin(angle);
    return { x, y };
  };

  // Create organic curved path between two points
  const createOrganicPath = (x1: number, y1: number, x2: number, y2: number, curvature: number = 0.3) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create control points for natural curve
    const controlX = midX + (-dy * curvature * distance / 100);
    const controlY = midY + (dx * curvature * distance / 100);
    
    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
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
              {/* Define gradients and filters for visual appeal */}
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000030"/>
                </filter>
                <linearGradient id="centralGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4A5568" />
                  <stop offset="100%" stopColor="#2D3748" />
                </linearGradient>
              </defs>

              {/* Main Branches - drawn first so they appear behind central topic */}
              {mindMap.branches.map((branch, branchIndex) => {
                const branchPosition = calculateMainBranchPosition(branchIndex, mindMap.branches.length);
                const branchColor = branchColors[branchIndex % branchColors.length];

                return (
                  <g key={branchIndex} className="main-branch">
                    {/* Organic curved main branch line */}
                    <path
                      d={createOrganicPath(centerX, centerY, branchPosition.x, branchPosition.y, 0.4)}
                      stroke={branchColor}
                      strokeWidth="8"
                      fill="none"
                      className="branch-line"
                      filter="url(#shadow)"
                    />
                    
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
                          {/* Organic sub-branch line with decreasing thickness */}
                          <path
                            d={createOrganicPath(branchPosition.x, branchPosition.y, subPosition.x, subPosition.y, 0.2)}
                            stroke={branchColor}
                            strokeWidth="4"
                            strokeOpacity="0.8"
                            fill="none"
                          />
                          
                          {/* Sub-branch node with meaningful content */}
                          <circle
                            cx={subPosition.x}
                            cy={subPosition.y}
                            r="25"
                            fill="#fff"
                            stroke={branchColor}
                            strokeWidth="3"
                            className="cursor-pointer hover:scale-105 transition-all duration-200"
                            filter="url(#shadow)"
                            onClick={() => alert(`${subtopic}\n\nDefinition: This is a key component of ${branch.topic} that helps in understanding the broader concept. Click to explore related resources and detailed explanations.`)}
                          />
                          
                          {/* Sub-branch keyword (single word/short phrase) */}
                          <text
                            x={subPosition.x}
                            y={subPosition.y - 2}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={branchColor}
                            fontSize="10"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {subtopic.split(' ')[0]} {/* Use only first word as keyword */}
                          </text>
                          
                          {/* Small additional text if needed */}
                          {subtopic.split(' ').length > 1 && (
                            <text
                              x={subPosition.x}
                              y={subPosition.y + 8}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={branchColor}
                              fontSize="7"
                              className="pointer-events-none"
                            >
                              {subtopic.split(' ')[1]?.substring(0, 6)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                    
                    {/* Main branch node - positioned after lines */}
                    <ellipse
                      cx={branchPosition.x}
                      cy={branchPosition.y}
                      rx="55"
                      ry="30"
                      fill={branchColor}
                      stroke="#fff"
                      strokeWidth="4"
                      className="cursor-pointer hover:opacity-95 transition-all duration-200"
                      filter="url(#shadow)"
                      onClick={() => handleNodeClick(branch.topic, branch.subtopics)}
                    />
                    
                    {/* Main branch keyword */}
                    <text
                      x={branchPosition.x}
                      y={branchPosition.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="13"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {branch.topic.split(' ')[0]} {/* Use first word as main keyword */}
                    </text>
                    
                    {/* Additional branch text if needed */}
                    {branch.topic.split(' ').length > 1 && (
                      <text
                        x={branchPosition.x}
                        y={branchPosition.y + 12}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="9"
                        fontWeight="500"
                        className="pointer-events-none"
                      >
                        {branch.topic.split(' ').slice(1).join(' ').substring(0, 10)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Central Topic - drawn last so it appears on top */}
              <g className="central-topic">
                <circle 
                  cx={centerX} 
                  cy={centerY} 
                  r="70" 
                  fill="url(#centralGrad)" 
                  stroke="#1A202C" 
                  strokeWidth="5"
                  filter="url(#shadow)"
                  className="cursor-pointer hover:opacity-95 transition-opacity duration-200"
                  onClick={() => alert(`Central Topic: ${mindMap.centralTopic}\n\nThis is the main focus of your learning journey. All branches stem from this core concept.`)}
                />
                <text
                  x={centerX}
                  y={centerY - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="15"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {mindMap.centralTopic.split(' ')[0]} {/* Main keyword */}
                </text>
                {mindMap.centralTopic.split(' ').length > 1 && (
                  <text
                    x={centerX}
                    y={centerY + 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#E2E8F0"
                    fontSize="11"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {mindMap.centralTopic.split(' ').slice(1).join(' ').substring(0, 12)}
                  </text>
                )}
              </g>
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
