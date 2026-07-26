import { CheckCircle, Loader2 } from 'lucide-react';
import { CheckpointItem } from '@/types';

interface CheckpointListProps {
  checkpoints: CheckpointItem[];
}

export function CheckpointList({ checkpoints }: CheckpointListProps) {
  return (
    <div className="border-r p-4 bg-gray-950 h-full border-gray-800">
      <h2 className="font-semibold mb-4">Generation Progress</h2>
      <div className="space-y-4">
        {checkpoints.map((checkpoint) => (
          <div key={checkpoint.id} className="flex items-center gap-3">
            {checkpoint.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            <span className={checkpoint.completed ? 'text-gray-300' : 'text-gray-500'}>
              {checkpoint.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}