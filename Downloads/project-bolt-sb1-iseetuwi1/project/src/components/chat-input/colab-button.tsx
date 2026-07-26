import { ExternalLink } from 'lucide-react';

interface ColabButtonProps {
  onClick: () => void;
}

export function ColabButton({ onClick }: ColabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border border-gray-700 px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
    >
      Open in Colab
      <ExternalLink className="w-4 h-4" />
    </button>
  );
}