import React from 'react';
import { Code2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold">CodeGen AI</span>
        </div>
      </div>
    </header>
  );
}