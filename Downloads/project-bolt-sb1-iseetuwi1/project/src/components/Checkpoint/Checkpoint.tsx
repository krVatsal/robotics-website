import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

export interface CheckpointItem {
  id: number;
  text: string;
  completed: boolean;
}

interface CheckpointProps {
  checkpoint: CheckpointItem;
}

export function Checkpoint({ checkpoint }: CheckpointProps) {
  return (
    <div className="flex items-center gap-3">
      {checkpoint.completed ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      )}
      <span className={checkpoint.completed ? 'text-gray-700' : 'text-gray-500'}>
        {checkpoint.text}
      </span>
    </div>
  );
}