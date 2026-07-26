import { CheckCircle, Loader2 } from 'lucide-react';

interface CheckpointItemProps {
  text: string;
  completed: boolean;
}

export function CheckpointItem({ text, completed }: CheckpointItemProps) {
  return (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      )}
      <span className={completed ? 'text-gray-200' : 'text-gray-400'}>
        {text}
      </span>
    </div>
  );
}