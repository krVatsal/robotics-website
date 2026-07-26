"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
  videoEnabled: boolean;
}

export function VoiceInput({ onTranscript, isProcessing, disabled, videoEnabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [amplitude, setAmplitude] = useState(0);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check for Speech Recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        if (result && result[0]) {
          const transcriptValue = result[0].transcript;
          setTranscript(transcriptValue);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setRecognitionSupported(true); // Keep it supported, just stop listening
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart recognition if we're still supposed to be listening
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error("Error restarting recognition:", error);
            setIsListening(false);
          }
        }
      };
    } else {
      setRecognitionSupported(false);
      console.warn("Speech recognition not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
      
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  const startListening = async () => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not available");
      return;
    }

    setTranscript("");
    setIsListening(true);
    
    try {
      // Request microphone access for audio visualization
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (audioContextRef.current && mediaStreamRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        
        const updateAmplitude = () => {
          if (!analyserRef.current || !isListening) return;
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const normalized = Math.min(100, average * 1.5);
          setAmplitude(normalized);
          
          animationRef.current = requestAnimationFrame(updateAmplitude);
        };
        
        updateAmplitude();
      }
      
      // Start speech recognition
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error accessing microphone or starting recognition:", error);
      setIsListening(false);
      
      // Try to start recognition without audio visualization
      try {
        recognitionRef.current.start();
      } catch (recError) {
        console.error("Failed to start speech recognition:", recError);
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Send transcript if we have one
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
    
    setAmplitude(0);
    setTranscript("");
  };

  const buttonSize = isListening ? "size-24" : "size-16";
  const buttonText = isListening ? "Stop" : "Speak";
  
  return (
    <div className="relative">
      <Card className={cn(
        "flex flex-col items-center justify-center py-6 transition-all",
        isListening && "bg-accent"
      )}>
        <div className="flex flex-col items-center gap-4">
          {isListening && (
            <div className="relative mb-2">
              <div className={cn(
                "absolute inset-0 rounded-full bg-primary/20 animate-ping",
                "scale-[1.75] opacity-0"
              )} />
              <div className={cn(
                "absolute inset-0 rounded-full bg-primary/40",
                "scale-[1.5] opacity-0",
                amplitude > 30 && "opacity-20 animate-ping"
              )} />
              <div className={cn(
                "absolute inset-0 rounded-full bg-primary/60",
                "scale-[1.25] opacity-0",
                amplitude > 50 && "opacity-40 animate-ping"
              )} />
            </div>
          )}
          
          <Button
            size="icon"
            variant={isListening ? "destructive" : "default"}
            className={cn(
              "rounded-full transition-all duration-200 flex items-center justify-center",
              buttonSize,
              (disabled || isProcessing) && "opacity-50 cursor-not-allowed"
            )}
            onClick={isListening ? stopListening : startListening}
            disabled={!recognitionSupported || disabled || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isListening ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          <span className="text-sm font-medium">
            {isProcessing 
              ? "Processing..." 
              : isListening 
                ? "Listening..." 
                : buttonText}
          </span>
          
          {isListening && (
            <div className="w-full max-w-lg mt-2">
              <Progress value={amplitude} className="h-1" />
            </div>
          )}
          
          {transcript && isListening && (
            <div className="mt-2 px-4 py-2 bg-muted rounded-lg max-w-lg">
              <p className="text-sm italic">{transcript}</p>
            </div>
          )}
          
          {!recognitionSupported && (
            <p className="text-sm text-destructive mt-2">
              Speech recognition is not supported in your browser.
            </p>
          )}

          {!videoEnabled && (
            <p className="text-xs text-muted-foreground mt-2">
              Video chat time limit reached. Your messages will be text-only.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}