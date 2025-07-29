import { useState, useEffect } from "react";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("content-input");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["content-input", "summary", "learning-path", "key-terms", "flashcards", "quiz", "mind-map", "additional-resources"];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="/crux-logo.png" 
              alt="Crux Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Crux</h1>
              <p className="text-xs text-gray-600 -mt-1">AI-powered contextual learning companion</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-6">
            {[
              { id: "content-input", label: "Input" },
              { id: "summary", label: "Summary" },
              { id: "learning-path", label: "Path" },
              { id: "key-terms", label: "Terms" },
              { id: "flashcards", label: "Flashcards" },
              { id: "quiz", label: "Quiz" },
              { id: "mind-map", label: "Mind Map" },
              { id: "additional-resources", label: "Resources" }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`transition-colors ${
                  activeSection === id 
                    ? "text-primary font-medium" 
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
