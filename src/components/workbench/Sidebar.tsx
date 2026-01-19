"use client";

import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, SortAsc, Edit2, Layers, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { knowledgePoints, selectedPointIds, togglePointSelection, setGroups, groups } = useWorkbenchStore();
  const [isSorting, setIsSorting] = useState(false);

  const handleSort = async () => {
    setIsSorting(true);
    try {
      const response = await fetch('/api/process/sorter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: knowledgePoints }),
      });
      const data = await response.json();
      if (data.groups) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Sorting failed:', error);
    } finally {
      setIsSorting(false);
    }
  };

  // Helper to render points list
  const renderPoints = (points: typeof knowledgePoints) => (
    <div className="space-y-3">
      {points.map((point) => (
        <div
          key={point.id}
          onClick={() => togglePointSelection(point.id)}
          className={cn(
            "group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
            selectedPointIds.includes(point.id)
              ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
              : "border-transparent bg-white/60 dark:bg-white/5 hover:bg-white/80 hover:shadow-sm hover:border-primary/20"
          )}
        >
          {/* Active Indicator Bar */}
          {selectedPointIds.includes(point.id) && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          )}
          
          <div className="flex items-start justify-between gap-3 pl-2">
            <h3 className={cn(
              "font-medium text-sm leading-snug transition-colors",
              selectedPointIds.includes(point.id) ? "text-primary font-semibold" : "text-foreground"
            )}>
              {point.title}
            </h3>
            {selectedPointIds.includes(point.id) && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 pl-2 leading-relaxed">
            {point.content}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-[300px] xl:w-[350px] mac-sidebar flex flex-col h-full z-10">
      {/* Header */}
      <div className="p-6 border-b border-white/10 space-y-4 bg-transparent sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Layers className="h-5 w-5" />
            <h2 className="font-bold text-lg tracking-tight">知识原料</h2>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            {knowledgePoints.length} 个
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "flex-1 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all",
              isSorting && "opacity-80"
            )}
            onClick={handleSort} 
            disabled={isSorting}
          >
            {isSorting ? <Sparkles className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-primary" />}
            {isSorting ? '正在AI排序...' : '智能排序'}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        {groups ? (
          <div className="space-y-8 pb-8">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300">
              <span className="font-semibold">排序逻辑:</span> {groups.sorting_logic}
            </div>
            {groups.groups.map((group, idx) => (
              <div key={idx} className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center gap-2 px-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="text-sm font-bold text-foreground">{group.group_name}</h3>
                </div>
                {/* <p className="text-xs text-muted-foreground px-4 mb-2 border-l-2 border-muted ml-1">{group.reason}</p> */}
                {renderPoints(knowledgePoints.filter(p => group.items.includes(p.id)))}
              </div>
            ))}
          </div>
        ) : (
          <div className="pb-8">
            {renderPoints(knowledgePoints)}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
