import { useState, useEffect } from "react";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("input");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["input", "summary", "flashcards", "quiz", "mindmap"];
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
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Learning Companion</h1>
          </div>
          <div className="hidden md:flex space-x-6">
            {[
              { id: "input", label: "Input" },
              { id: "summary", label: "Summary" },
              { id: "flashcards", label: "Flashcards" },
              { id: "quiz", label: "Quiz" },
              { id: "mindmap", label: "Mind Map" }
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
