"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { DocumentUpload } from "@/components/document-upload";
import { VoiceInput } from "@/components/voice-input";
import { AvatarDisplay } from "@/components/avatar-display";
import { TranscriptDisplay } from "@/components/transcript-display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

// API base URL configuration
// Using environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function TutorApp() {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Mira, your AI tutor. You can ask me questions about any topic, or upload a document for me to analyze and discuss with you. How can I help you today?",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tab, setTab] = useState<string>("chat");
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleDocumentUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
        // Add a timeout to prevent long waiting times
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const data = await response.json();
      
      setActiveDocument(file.name);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've processed the document "${file.name}". What would you like to know about it?`,
        },
      ]);
      
      setTab("chat");
    } catch (error) {
      console.error("Error uploading document:", error);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, there was an error processing your document. Please check if the server is running and try again.",
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      { role: "user", content: transcript },
    ]);
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: transcript,
          document_name: activeDocument
        }),
        // Add a timeout to prevent long waiting times
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      
      generateAvatarResponse(data.response);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I'm having trouble understanding. Could you try asking again?",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAvatarResponse = async (text: string) => {
    if (!videoEnabled) return;

    try {
      // Try to use the local API endpoint first
      const response = await fetch(`${API_BASE_URL}/api/generate-avatar-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `text=${encodeURIComponent(text)}`,
        // Add a timeout to prevent long waiting times
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error("Failed to generate avatar response");
      }

      const data = await response.json();
      console.log("Avatar response generated:", data);
    } catch (error) {
      console.error("Error generating avatar response:", error);
      // Continue execution even if avatar generation fails
      // This prevents the entire conversation from breaking
    }
  };

  const handleSummarizeDocument = async () => {
    if (!activeDocument) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ document_name: activeDocument }),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        throw new Error("Failed to summarize document");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "Can you summarize this document?" },
        { role: "assistant", content: data.summary },
      ]);
      
      generateAvatarResponse(data.summary);
      
    } catch (error) {
      console.error("Error summarizing document:", error);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't summarize the document. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <Tabs 
          value={tab} 
          onValueChange={setTab}
          className="flex-1 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="chat" className="text-base">Chat with Mira</TabsTrigger>
              <TabsTrigger value="upload" className="text-base">Upload Document</TabsTrigger>
            </TabsList>
            
            {activeDocument && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Active: {activeDocument}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSummarizeDocument}
                  disabled={isProcessing}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Summarize
                </Button>
              </div>
            )}
          </div>
          
          <TabsContent 
            value="chat" 
            className={cn(
              "flex-1 flex flex-col space-y-6 md:space-y-8",
              tab !== "chat" && "hidden"
            )}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
              <Card className="col-span-1 lg:col-span-3">
                <CardContent className="p-4 sm:p-6 h-[500px] flex flex-col">
                                                     <AvatarDisplay 
                                      isProcessing={isProcessing}
                                      lastMessage={messages[messages.length - 1]}
                                      videoEnabled={videoEnabled}
                                      setVideoEnabled={setVideoEnabled}
                                    />
                                  </CardContent>
                                </Card>
                                
                                <Card className="col-span-1 lg:col-span-2">
                                  <CardContent className="p-4 sm:p-6 h-[500px] flex flex-col">
                                    <TranscriptDisplay 
                                      messages={messages} 
                                      isProcessing={isProcessing} 
                                    />
                                  </CardContent>
                                </Card>
                              </div>
                              
                              <div className="mt-auto">
                                <VoiceInput 
                                  onTranscript={handleVoiceInput} 
                                  isProcessing={isProcessing}
                                  disabled={false}
                                  videoEnabled={videoEnabled}
                                />
                              </div>
                            </TabsContent>
                            
                            <TabsContent 
                              value="upload"
                              className={cn(
                                "flex-1 flex flex-col",
                                tab !== "upload" && "hidden"
                              )}
                            >
                              <Card className="flex-1">
                                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full">
                                  <DocumentUpload 
                                    onUpload={handleDocumentUpload} 
                                    isUploading={isUploading}
                                  />
                                  
                                  <div className="mt-8 text-center">
                                    <h3 className="text-lg font-medium mb-2">Upload a document to get started</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                      Upload PDF documents, research papers, or text files for Mira to analyze and discuss with you.
                                    </p>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="lg" 
                                      className="mt-4"
                                      onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                      <FileUp className="h-5 w-5 mr-2" />
                                      Select Document
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    );
                  }