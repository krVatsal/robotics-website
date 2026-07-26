import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { TextArea } from './TextArea';

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
      <TextArea
        id="prompt"
        label="Enter your prompt"
        value={prompt}
        onChange={setPrompt}
        placeholder="Describe what you want to create..."
        height="h-32"
      />

      <TextArea
        id="training"
        label="Training Data (Optional)"
        value={trainingData}
        onChange={setTrainingData}
        placeholder="Add sample training data here..."
        height="h-48"
      />

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