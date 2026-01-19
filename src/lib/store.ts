import { create } from 'zustand';
import { KnowledgePoint, SorterResult } from './types';

interface WorkbenchState {
  viewMode: 'input' | 'workbench';
  knowledgePoints: KnowledgePoint[];
  selectedPointIds: number[];
  groups: SorterResult | null;
  currentTab: string;
  
  // Actions
  setViewMode: (mode: 'input' | 'workbench') => void;
  setKnowledgePoints: (points: KnowledgePoint[]) => void;
  togglePointSelection: (id: number) => void;
  setGroups: (groups: SorterResult) => void;
  setCurrentTab: (tab: string) => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  viewMode: 'input',
  knowledgePoints: [],
  selectedPointIds: [],
  groups: null,
  currentTab: 'visual',

  setViewMode: (mode) => set({ viewMode: mode }),
  setKnowledgePoints: (points) => set({ knowledgePoints: points }),
  togglePointSelection: (id) => set((state) => {
    if (state.selectedPointIds.includes(id)) {
      return { selectedPointIds: state.selectedPointIds.filter((pid) => pid !== id) };
    } else {
      return { selectedPointIds: [...state.selectedPointIds, id] };
    }
  }),
  setGroups: (groups) => set({ groups }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
}));
