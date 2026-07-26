import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onOpenColab: () => void;
}

export function ChatInput({ onSendMessage, onOpenColab }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-800 p-4 bg-gray-200">
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
          onClick={onOpenColab}
          className="flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Open in Colab
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}