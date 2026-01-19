import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithTemp } from '@/lib/ai';
import { VISUALIZER_PROMPT } from '@/prompts';
import { VisualizerResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const result = await generateJSONWithTemp<VisualizerResult>(content, VISUALIZER_PROMPT, 0.1);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Visualizer Error:', error);
    return NextResponse.json({ error: 'Failed to visualize content' }, { status: 500 });
  }
}
