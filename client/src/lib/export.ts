import jsPDF from "jspdf";
import type { LearningContent, Flashcard } from "@shared/schema";

export function exportToPDF(data: LearningContent) {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Learning Toolkit", margin, yPosition);
    yPosition += 20;

    // Summary
    if (data.summary) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const summaryLines = pdf.splitTextToSize(data.summary, 170);
      pdf.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 6 + 15;
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    // Flashcards
    if (data.flashcards && data.flashcards.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Flashcards", margin, yPosition);
      yPosition += 15;

      data.flashcards.forEach((card, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. Q: ${card.question}`, margin, yPosition);
        yPosition += 8;

        pdf.setFont("helvetica", "normal");
        const answerLines = pdf.splitTextToSize(`A: ${card.answer}`, 170);
        pdf.text(answerLines, margin, yPosition);
        yPosition += answerLines.length * 6 + 10;
      });
    }

    // Quiz
    if (data.quiz && data.quiz.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Quiz Questions", margin, yPosition);
      yPosition += 15;

      data.quiz.forEach((question, index) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${question.question}`, margin, yPosition);
        yPosition += 10;

        question.options.forEach((option, optIndex) => {
          pdf.setFont("helvetica", "normal");
          const marker = optIndex === question.correctAnswer ? "✓" : "○";
          pdf.text(`${marker} ${option}`, margin + 5, yPosition);
          yPosition += 6;
        });

        pdf.setFont("helvetica", "italic");
        const explanationLines = pdf.splitTextToSize(`Explanation: ${question.explanation}`, 160);
        pdf.text(explanationLines, margin + 5, yPosition);
        yPosition += explanationLines.length * 6 + 10;
      });
    }

    pdf.save("learning-toolkit.pdf");
  } catch (error) {
    console.error("Failed to export PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}

export function exportAnkiCSV(flashcards: Flashcard[]) {
  try {
    const csvContent = flashcards
      .map(card => `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}"`)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "flashcards-anki.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Failed to export Anki CSV:", error);
    alert("Failed to export CSV. Please try again.");
  }
}
