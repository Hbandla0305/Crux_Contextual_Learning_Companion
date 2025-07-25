import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import YouTubePlaylistProcessor from "./YouTubePlaylistProcessor";

interface YouTubeEnhancedProps {
  onContentProcessed: (data: any) => void;
  setIsLoading: (loading: boolean) => void;
  complexityLevel: number;
}

export default function YouTubeEnhanced({ onContentProcessed, setIsLoading, complexityLevel }: YouTubeEnhancedProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const { toast } = useToast();

  const validateYouTubeUrl = (url: string) => {
    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
    return youtubePattern.test(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    setIsValidUrl(validateYouTubeUrl(url));
  };

  const processYouTubeVideo = async () => {
    if (!isValidUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/process-content', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: youtubeUrl.trim(),
          complexityLevel 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process YouTube video');
      }

      const data = await response.json();
      onContentProcessed(data);
      
      toast({
        title: "Success!",
        description: "YouTube video transcript processed successfully!",
      });

    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(youtubeUrl);

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader>
        <CardTitle className="flex items-center text-red-700">
          <i className="fab fa-youtube mr-2 text-xl"></i>
          YouTube Video Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={handleUrlChange}
            className={`${isValidUrl ? 'border-green-500' : youtubeUrl ? 'border-red-500' : ''}`}
          />
          {youtubeUrl && !isValidUrl && (
            <p className="text-sm text-red-600 mt-1">
              Please enter a valid YouTube URL
            </p>
          )}
          {isValidUrl && (
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Valid URL
              </Badge>
              {videoId && (
                <span className="text-xs text-gray-500">
                  Video ID: {videoId}
                </span>
              )}
            </div>
          )}
        </div>

        {isValidUrl && videoId && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Video Preview</h4>
            <div className="aspect-video max-w-sm">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">YouTube Features:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Automatic transcript extraction</li>
            <li>• Video metadata (title, channel, views, duration)</li>
            <li>• Chapter detection and timestamps</li>
            <li>• Full video description analysis</li>
            <li>• Adaptive learning materials based on complexity level</li>
          </ul>
        </div>

        <Button
          onClick={processYouTubeVideo}
          disabled={!isValidUrl}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <i className="fab fa-youtube mr-2"></i>
          Process YouTube Video
        </Button>

        <div className="text-xs text-gray-500">
          <p>
            <strong>Note:</strong> Video must have captions/subtitles enabled. 
            Some videos may not be available due to regional restrictions or privacy settings.
          </p>
        </div>

        {/* Playlist Processor */}
        <YouTubePlaylistProcessor 
          onContentProcessed={onContentProcessed}
          setIsLoading={setIsLoading}
          complexityLevel={complexityLevel}
        />
      </CardContent>
    </Card>
  );
}