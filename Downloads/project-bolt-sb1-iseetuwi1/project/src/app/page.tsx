import { PromptForm } from '@/components/prompt-form';

export default function Home() {
  return (
    <main className="bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-100">AI Code Generation</h1>
          <p className="text-gray-400">
            Enter your prompt and optional training data to generate code automatically.
          </p>
        </div>
        <PromptForm />
      </div>
    </main>
  );
}