'use client';

import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { MobileTopBar } from '@/components/ui/MobileTopBar';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { AssignmentsList } from '@/components/ui/AssignmentsList';

export default function HomePage() {
  // Toggle between empty and populated state
  // When real data is connected, this would check assignment count
  const hasAssignments = true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom relative">
      {/* Desktop Sidebar */}
      <Sidebar assignmentCount={hasAssignments ? 10 : 0} />

      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Main Content Area */}
      <div className="lg:ml-[327px]">
        {/* Desktop Top Bar */}
        <div className="px-0 pt-3 lg:px-0">
          <TopBar />
        </div>

        {/* Content */}
        {hasAssignments ? (
          <main className="px-4 lg:px-6 py-6 pb-40 lg:pb-8">
            <AssignmentsList />
          </main>
        ) : (
          <main className="flex items-center justify-center min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-80px)] px-4 pb-40 lg:pb-8">
            <EmptyState />
          </main>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
