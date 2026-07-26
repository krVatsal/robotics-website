import React, { useState } from 'react';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import ResponsePage from './components/ResponsePage';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptSubmit = (prompt: string, trainingData: string) => {
    console.log('Prompt:', prompt);
    console.log('Training Data:', trainingData);
    setIsGenerating(true);
  };

  const handleContinueConversation = (message: string) => {
    console.log('Continuing conversation with:', message);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {!isGenerating ? (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">AI Code Generation</h1>
              <p className="text-gray-600">
                Enter your prompt and optional training data to generate code automatically.
              </p>
            </div>
            <PromptForm onSubmit={handlePromptSubmit} />
          </div>
        ) : (
          <ResponsePage onContinueConversation={handleContinueConversation} />
        )}
      </main>
    </div>
  );
}

export default App;