'use client';

import { useState } from 'react';
import { SendButton } from './send-button';
import { ColabButton } from './colab-button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleOpenColab = () => {
    window.open('https://colab.research.google.com/drive/#create=true', '_blank');
  };

  return (
    <div className="border-t border-gray-800 p-4 bg-gray-900">
      <div className="flex gap-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border border-gray-700 rounded-lg px-4 py-2 bg-gray-800 text-gray-100 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   placeholder:text-gray-400"
          placeholder="Continue the conversation..."
        />
        <SendButton onClick={handleSend} />
        <ColabButton onClick={handleOpenColab} />
      </div>
    </div>
  );
}