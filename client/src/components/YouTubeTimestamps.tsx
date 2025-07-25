import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Timestamp {
  time: string;
  title: string;
  description?: string;
}

interface YouTubeTimestampsProps {
  timestamps: Timestamp[];
  videoUrl: string;
}

export default function YouTubeTimestamps({ timestamps, videoUrl }: YouTubeTimestampsProps) {
  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const convertTimeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const createTimestampUrl = (time: string) => {
    const videoId = getVideoId(videoUrl);
    const seconds = convertTimeToSeconds(time);
    return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
  };

  if (!timestamps || timestamps.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700">
          <i className="fas fa-clock mr-2"></i>
          Video Chapters & Timestamps
          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
            {timestamps.length} sections
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {timestamps.map((timestamp, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex-shrink-0">
              <a
                href={createTimestampUrl(timestamp.time)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-play mr-1"></i>
                {timestamp.time}
              </a>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{timestamp.title}</h4>
              {timestamp.description && (
                <p className="text-sm text-gray-600">{timestamp.description}</p>
              )}
            </div>
          </div>
        ))}
        
        <div className="text-xs text-gray-500 text-center pt-2">
          <p>Click any timestamp to jump to that section in the video</p>
        </div>
      </CardContent>
    </Card>
  );
}