import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToPDF, exportAnkiCSV } from "@/lib/export";
import type { LearningContent } from "@shared/schema";

interface ExportSectionProps {
  data: LearningContent;
}

export default function ExportSection({ data }: ExportSectionProps) {
  if (!data) return null;

  const handlePDFExport = () => {
    exportToPDF(data);
  };

  const handleAnkiExport = () => {
    if (data.flashcards) {
      exportAnkiCSV(data.flashcards);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <i className="fas fa-download mr-3"></i>
          Export Your Learning Materials
        </h2>
        <p className="text-gray-300 mb-8">
          Take your learning toolkit with you. Export everything to your favorite apps and devices.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Button
            onClick={handlePDFExport}
            className="bg-red-600 hover:bg-red-700 p-6 h-auto flex-col items-start text-left group"
          >
            <i className="fas fa-file-pdf text-2xl mb-3 group-hover:scale-110 transition-transform"></i>
            <h3 className="font-semibold mb-2">Complete PDF</h3>
            <p className="text-sm text-red-100">Summary, flashcards, and quiz in one document</p>
          </Button>

          <Button
            onClick={handleAnkiExport}
            disabled={!data.flashcards || data.flashcards.length === 0}
            className="bg-green-600 hover:bg-green-700 p-6 h-auto flex-col items-start text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-table text-2xl mb-3 group-hover:scale-110 transition-transform"></i>
            <h3 className="font-semibold mb-2">Anki CSV</h3>
            <p className="text-sm text-green-100">Import flashcards directly into Anki</p>
          </Button>

          <div className="bg-blue-600 p-6 rounded-xl opacity-50">
            <i className="fas fa-image text-2xl mb-3"></i>
            <h3 className="font-semibold mb-2">Mind Map PNG</h3>
            <p className="text-sm text-blue-100">Use the download button in the Mind Map section</p>
          </div>
        </div>
      </div>
    </section>
  );
}
