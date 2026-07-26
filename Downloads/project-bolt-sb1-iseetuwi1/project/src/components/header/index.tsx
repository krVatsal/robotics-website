import { Code2 } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Code2 className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold text-gray-100">CodeGen AI</span>
        </Link>
      </div>
    </header>
  );
}