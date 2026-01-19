import { supabase } from './client';

export interface KnowledgePoint {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  created_at?: string;
}

export interface MemoryItem {
  id?: string;
  type: 'visual' | 'story' | 'podcast' | 'feynman' | 'cloze';
  content: any;
  knowledge_point_ids: string[];
  created_at?: string;
}

export const dbService = {
  async saveKnowledgePoints(points: KnowledgePoint[]) {
    const { data, error } = await supabase
      .from('knowledge_points')
      .insert(points)
      .select();
    
    if (error) throw error;
    return data;
  },

  async getKnowledgePoints() {
    const { data, error } = await supabase
      .from('knowledge_points')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async saveMemoryItem(item: MemoryItem) {
    const { data, error } = await supabase
      .from('memory_items')
      .insert(item)
      .select();

    if (error) throw error;
    return data;
  }
};
