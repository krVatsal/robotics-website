import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

interface PromptFormProps {
  onSubmit: (prompt: string, trainingData: string) => void;
}

export default function PromptForm({ onSubmit }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const [trainingData, setTrainingData] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt, trainingData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Enter your prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe what you want to create..."
        />
      </div>

      <div>
        <label htmlFor="training" className="block text-sm font-medium text-gray-700 mb-2">
          Training Data (Optional)
        </label>
        <textarea
          id="training"
          value={trainingData}
          onChange={(e) => setTrainingData(e.target.value)}
          className="w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add sample training data here..."
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Generate Code
        <SendHorizontal className="w-5 h-5" />
      </button>
    </form>
  );
}