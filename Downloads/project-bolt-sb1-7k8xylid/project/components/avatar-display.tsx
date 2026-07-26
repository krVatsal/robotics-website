"use client";

import { useState, useEffect, useRef } from "react";
import ReactPlayer from 'react-player';
import { Loader2, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { AvatarFallback } from "./avatar-fallback";

interface AvatarDisplayProps {
  isProcessing: boolean;
  lastMessage: Message;
  videoEnabled: boolean;
  setVideoEnabled: (enabled: boolean) => void;
}

export function AvatarDisplay({ isProcessing, lastMessage, videoEnabled, setVideoEnabled }: AvatarDisplayProps) {
  const [speaking, setSpeaking] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const statusCheckInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isProcessing && lastMessage && videoEnabled && lastMessage.role === 'assistant') {
      generateVideo(lastMessage.content);
    }
  }, [isProcessing, lastMessage, videoEnabled]);

  const generateVideo = async (text: string) => {
    try {
      setIsGeneratingVideo(true);
      
      // Try to use the local API endpoint first with fallback behavior
      try {
        // Use the backend proxy instead of direct Tavus API call to avoid exposing API keys
        const response = await fetch('/api/generate-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
          signal: AbortSignal.timeout(15000), // 15 second timeout
        });
        
        if (!response.ok) {
          throw new Error('Failed to initiate video generation');
        }
        
        const data = await response.json();
        const videoId = data.id;

        // Poll for video status using the backend proxy
        statusCheckInterval.current = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/video-status/${videoId}`);
            
            if (!statusResponse.ok) {
              throw new Error('Failed to get video status');
            }
            
            const statusData = await statusResponse.json();
            
            if (statusData.status === 'completed') {
              setVideoUrl(statusData.url);
              setSpeaking(true);
              clearInterval(statusCheckInterval.current);
              setIsGeneratingVideo(false);
            }
          } catch (error) {
            console.error('Error checking video status:', error);
            clearInterval(statusCheckInterval.current);
            setIsGeneratingVideo(false);
          }
        }, 2000);
      } catch (error) {
        // If the frontend API route fails, try the backend API directly
        console.error('Error with frontend API route, trying backend directly:', error);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        
        const response = await fetch(`${apiBaseUrl}/api/generate-avatar-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `text=${encodeURIComponent(text)}`,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
          throw new Error('Failed to generate avatar response from backend');
        }

        const data = await response.json();
        if (data.url) {
          setVideoUrl(data.url);
          setSpeaking(true);
        }
        setIsGeneratingVideo(false);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setIsGeneratingVideo(false);
    }
  };

  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-full max-w-[400px] aspect-video rounded-lg overflow-hidden border">
        {(isProcessing || isGeneratingVideo) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : null}
        
        <div className="relative w-full h-full">
          {videoUrl ? (
            <ReactPlayer
              url={videoUrl}
              width="100%"
              height="100%"
              playing={speaking}
              onEnded={() => {
                setSpeaking(false);
                setVideoUrl(null);
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-primary/5 to-primary/10">
              <AvatarFallback className="w-24 h-24 opacity-50" />
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 origin-left transition-transform",
                speaking && "animate-[grow_2s_ease-in-out_infinite]"
              )} />
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-center max-w-lg">
        <p className="text-sm text-muted-foreground">
          {isGeneratingVideo 
            ? "Generating video response..." 
            : speaking 
              ? "Mira is speaking..." 
              : "Mira is waiting for your question..."}
        </p>
        {!videoEnabled && (
          <p className="text-xs text-muted-foreground mt-1">
            Video chat is disabled. Continuing in text mode.
          </p>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? (
            <>
              <VideoOff className="h-4 w-4 mr-2" />
              Disable Video
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Enable Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
}