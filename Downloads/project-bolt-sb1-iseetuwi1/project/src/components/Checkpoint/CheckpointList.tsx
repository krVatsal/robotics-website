import React from 'react';
import { Checkpoint, CheckpointItem } from './Checkpoint';

interface CheckpointListProps {
  checkpoints: CheckpointItem[];
}

export function CheckpointList({ checkpoints }: CheckpointListProps) {
  return (
    <div className="border-r p-4 bg-gray-50">
      <h2 className="font-semibold mb-4">Generation Progress</h2>
      <div className="space-y-4">
        {checkpoints.map((checkpoint) => (
          <Checkpoint key={checkpoint.id} checkpoint={checkpoint} />
        ))}
      </div>
    </div>
  );
}