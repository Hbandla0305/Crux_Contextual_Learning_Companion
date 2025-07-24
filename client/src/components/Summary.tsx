import { Card, CardContent } from "@/components/ui/card";

interface SummaryProps {
  summary: string;
}

export default function Summary({ summary }: SummaryProps) {
  if (!summary) return null;

  // Split summary into paragraphs
  const paragraphs = summary.split('\n\n').filter(p => p.trim());

  return (
    <section id="summary" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-lg animate-fade-in">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-file-text text-primary mr-3"></i>
              Quick Summary
            </h2>
          </div>
          <div className="prose max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
