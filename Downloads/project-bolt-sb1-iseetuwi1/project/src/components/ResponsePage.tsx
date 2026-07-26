import React, { useState } from 'react';
import { CheckCircle, Loader2, ExternalLink } from 'lucide-react';

interface ResponsePageProps {
  onContinueConversation: (message: string) => void;
}

export default function ResponsePage({ onContinueConversation }: ResponsePageProps) {
  const [message, setMessage] = useState('');
  const [checkpoints] = useState([
    { id: 1, text: 'Analyzing prompt', completed: true },
    { id: 2, text: 'Generating code structure', completed: true },
    { id: 3, text: 'Implementing functionality', completed: false },
    { id: 4, text: 'Optimizing code', completed: false },
  ]);

  const handleOpenColab = () => {
    const colabUrl = 'https://colab.research.google.com/drive/#create=true';
    window.open(colabUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-73px)]">
      {/* Left sidebar */}
      <div className="border-r p-4 bg-gray-50">
        <h2 className="font-semibold mb-4">Generation Progress</h2>
        <div className="space-y-4">
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint.id} className="flex items-center gap-3">
              {checkpoint.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              )}
              <span className={checkpoint.completed ? 'text-gray-700' : 'text-gray-500'}>
                {checkpoint.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6 bg-gray-950 overflow-auto">
          <pre className="bg-gray-800 p-6 rounded-lg shadow">
            <code className="text-sm">
              // Generated code will appear here
              {` function example() {
                console.log("Hello, World!");
              }`}
            </code>
          </pre>
        </div>

        {/* Bottom chat input */}
        <div className="border-t border-gray-800 p-4 bg-white">
          <div className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Continue the conversation..."
            />
            <button
              onClick={() => onContinueConversation(message)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
            <button
              onClick={handleOpenColab}
              className="flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Open in Colab
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}