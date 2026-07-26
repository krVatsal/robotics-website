import { CheckpointItem } from './checkpoint-item';
import type { CheckpointItem as CheckpointItemType } from '@/types';

interface CheckpointListProps {
  checkpoints: CheckpointItemType[];
}

export function CheckpointList({ checkpoints }: CheckpointListProps) {
  return (
    <div className="border-r border-gray-800 p-4 bg-gray-900">
      <h2 className="font-semibold mb-4 text-gray-100">Generation Progress</h2>
      <div className="space-y-4">
        {checkpoints.map((checkpoint) => (
          <CheckpointItem
            key={checkpoint.id}
            text={checkpoint.text}
            completed={checkpoint.completed}
          />
        ))}
      </div>
    </div>
  );
}