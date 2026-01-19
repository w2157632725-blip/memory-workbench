export interface KnowledgePoint {
  id: number;
  title: string;
  content: string;
  tags?: string[];
}

export interface VisualizerResult {
  type: 'mermaid' | 'html';
  code: string;
  explanation: string;
}

export interface SortingGroup {
  group_name: string;
  reason: string;
  items: number[]; // IDs
}

export interface SorterResult {
  sorting_logic: string;
  groups: SortingGroup[];
}

export interface StoryMapping {
  original: string;
  mnemonic: string;
}

export interface StoryResult {
  story_text: string;
  mapping: StoryMapping[];
  image_prompt: string;
  explanation?: string;
}

export interface PodcastLine {
  speaker: 'Host A' | 'Host B';
  text: string;
}

export interface FeynmanFeedback {
  score: number;
  feedback_summary: string;
  highlighted_issues: { segment: string; issue: string }[];
  next_question: string;
}

export interface ClozePart {
  answer: string;
  position_index: number; // In the full sentence? Or just order? The prompt implies structure.
  // The prompt example says "position_index": 0.
  hint_1: string;
  hint_2: string;
}

export interface ClozeItem {
  full_sentence: string;
  cloze_parts: ClozePart[];
}
