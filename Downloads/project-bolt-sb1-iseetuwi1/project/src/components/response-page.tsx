'use client';

import { useState } from 'react';
import { CheckpointList } from './checkpoint-list';
import { CodeDisplay } from './code-display';
import { ChatInput } from './chat-input';
import type { CheckpointItem } from '@/types';

export function ResponsePage() {
  const [checkpoints] = useState<CheckpointItem[]>([
    { id: 1, text: 'Analyzing prompt', completed: true },
    { id: 2, text: 'Generating code structure', completed: true },
    { id: 3, text: 'Implementing functionality', completed: false },
    { id: 4, text: 'Optimizing code', completed: false },
  ]);

  const [generatedCode] = useState(`// Generated code will appear here
function example() {
  console.log("Hello, World!");
}`);

  const handleContinueConversation = (message: string) => {
    console.log('Continuing conversation with:', message);
  };

  return (
    <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-73px)]">
      <CheckpointList checkpoints={checkpoints} />
      <div className="flex flex-col h-full">
        <CodeDisplay code={generatedCode} />
        <ChatInput onSendMessage={handleContinueConversation} />
      </div>
    </div>
  );
}