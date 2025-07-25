import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface YouTubePlaylistProcessorProps {
  onContentProcessed: (data: any) => void;
  setIsLoading: (loading: boolean) => void;
  complexityLevel: number;
}

export default function YouTubePlaylistProcessor({ 
  onContentProcessed, 
  setIsLoading, 
  complexityLevel 
}: YouTubePlaylistProcessorProps) {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const { toast } = useToast();

  const validatePlaylistUrl = (url: string) => {
    const playlistPattern = /(?:youtube\.com\/playlist\?list=|youtube\.com\/watch\?.*list=)([a-zA-Z0-9_-]+)/;
    return playlistPattern.test(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPlaylistUrl(url);
    setIsValidUrl(validatePlaylistUrl(url));
  };

  const processPlaylist = async () => {
    if (!isValidUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube playlist URL",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Playlist Processing",
      description: "This feature would process multiple videos from a playlist. Currently supports individual videos.",
      variant: "default",
    });
  };

  return (
    <Card className="border-purple-200 bg-purple-50/30 mt-4">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <i className="fas fa-list mr-2"></i>
          YouTube Playlist Processor
          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Playlist URL
          </label>
          <Input
            type="url"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={playlistUrl}
            onChange={handleUrlChange}
            className={`${isValidUrl ? 'border-green-500' : playlistUrl ? 'border-red-500' : ''}`}
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">
            Feature in development - will support processing multiple videos from playlists
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">Planned Features:</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Process entire YouTube playlists</li>
            <li>• Select specific videos to analyze</li>
            <li>• Batch processing with progress tracking</li>
            <li>• Combined learning materials from multiple videos</li>
            <li>• Cross-video knowledge synthesis</li>
          </ul>
        </div>

        <Button
          onClick={processPlaylist}
          disabled={true}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white opacity-50 cursor-not-allowed"
        >
          <i className="fas fa-list mr-2"></i>
          Process Playlist (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
}