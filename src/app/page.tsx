"use client";

import { useWorkbenchStore } from '@/lib/store';
import InputView from '@/components/workbench/InputView';
import Sidebar from '@/components/workbench/Sidebar';
import Workspace from '@/components/workbench/Workspace';

export default function Home() {
  const { viewMode } = useWorkbenchStore();

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {viewMode === 'input' ? (
        <InputView />
      ) : (
        <main className="flex h-full pt-0">
          <Sidebar />
          <Workspace />
        </main>
      )}
    </div>
  );
}
