'use client';

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <pre className="bg-gray-800 p-6 rounded-lg shadow text-gray-100 overflow-auto">
      <code className="text-sm font-mono">{code}</code>
    </pre>
  );
}