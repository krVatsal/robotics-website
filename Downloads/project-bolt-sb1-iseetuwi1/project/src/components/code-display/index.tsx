'use client';

import { CodeBlock } from './code-block';

interface CodeDisplayProps {
  code: string;
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  return (
    <div className="flex-1 p-6 bg-gray-900 overflow-auto">
      <CodeBlock code={code} />
    </div>
  );
}