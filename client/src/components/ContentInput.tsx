import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContentInputProps {
  onContentProcessed: (data: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function ContentInput({ onContentProcessed, setIsLoading }: ContentInputProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.includes('text') || file.type.includes('pdf')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or TXT file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('text') || file.type.includes('pdf')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or TXT file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processContent = async () => {
    if (!content.trim() && !selectedFile) {
      toast({
        title: "No content provided",
        description: "Please enter text or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (selectedFile) {
        // Process file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        response = await fetch('/api/upload-file', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Process text content
        response = await apiRequest('POST', '/api/process-content', {
          content: content.trim()
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process content');
      }

      const data = await response.json();
      onContentProcessed(data);
      
      toast({
        title: "Success!",
        description: "Your learning toolkit has been created.",
      });

    } catch (error) {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > 20000;

  return (
    <section id="input" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Transform Any Content Into a Learning Toolkit
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Paste a YouTube link, article URL, or raw text and get instant summaries, flashcards, quizzes, and visual mind maps.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-edit mr-2"></i>Content Input
              </label>
              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Paste a YouTube link, article URL, or raw text (up to 20,000 characters)"
                className="h-32 resize-none"
                maxLength={20000}
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Auto-detects URLs and YouTube links
                </span>
                <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                  {charCount.toLocaleString()} / 20,000
                </span>
              </div>
            </div>

            {/* File Upload */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
              <p className="text-gray-600 mb-2">Drag and drop your files here</p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF and TXT files</p>
              <Button variant="outline">Browse Files</Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileSelect}
              />
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-alt text-primary"></i>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Process Button */}
            <Button
              onClick={processContent}
              disabled={(!content.trim() && !selectedFile) || isOverLimit}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 py-4 text-lg font-semibold transform hover:scale-[1.02] transition-all"
            >
              <i className="fas fa-magic mr-2"></i>
              Create Learning Toolkit
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
