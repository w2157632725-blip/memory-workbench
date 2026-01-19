import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithTemp } from '@/lib/ai';
import { PODCAST_PROMPT } from '@/prompts';
import { PodcastLine } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const result = await generateJSONWithTemp<{ script: PodcastLine[] }>(content, PODCAST_PROMPT, 0.7);

    return NextResponse.json(result.script || []);
  } catch (error: any) {
    console.error('Podcast Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate podcast script',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
