'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { AssignmentCard } from '@/components/ui/AssignmentCard';

interface Assignment {
  id: string;
  title: string;
  assignedOn: string;
  dueDate?: string;
}

// Demo data matching Figma
const demoAssignments: Assignment[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: 'Quiz on Electricity',
  assignedOn: '20-06-2025',
  dueDate: '21-06-2025',
}));

export function AssignmentsList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const assignments = demoAssignments;

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 w-full animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          <h1 className="text-2xl lg:text-[28px] font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
            Assignments
          </h1>
        </div>
        <p className="text-sm tracking-[-0.04em] text-text-secondary leading-[140%] ml-[18px]">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        {/* Filter Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#e0e0e0] rounded-xl bg-white hover:bg-bg-offwhite transition-colors text-sm text-text-secondary">
          <SlidersHorizontal size={16} className="text-text-secondary" />
          Filter By
        </button>

        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bg-disabled" />
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e0e0e0] rounded-xl bg-white text-sm text-text-primary placeholder:text-bg-disabled focus:outline-none focus:border-[#c0c0c0] transition-colors"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            title={assignment.title}
            assignedOn={assignment.assignedOn}
            dueDate={assignment.dueDate}
            onView={() => console.log('View', assignment.id)}
            onDelete={() => console.log('Delete', assignment.id)}
          />
        ))}
      </div>

      {/* Floating Create Button - desktop only */}
      <div className="hidden lg:flex justify-center sticky bottom-6 z-20">
        <button
          onClick={() => router.push('/create')}
          className="flex items-center gap-1.5 bg-btn-primary text-white rounded-full px-6 py-3 shadow-realistic hover:bg-[#2a2a2a] transition-colors"
        >
          <Plus size={20} className="text-white" strokeWidth={2} />
          <span className="text-base font-medium tracking-[-0.04em]">
            Create Assignment
          </span>
        </button>
      </div>
    </div>
  );
}
