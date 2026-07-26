'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

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
    <div className="border-t p-4 bg-gray-800">
      <div className="flex gap-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Continue the conversation..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
        <button
          onClick={handleOpenColab}
          className="flex items-center gap-2 border border-gray-900 px-6 py-2 rounded-lg bg-gray-900 hover:bg-gray-950 transition-colors"
        >
          Open in Colab
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}