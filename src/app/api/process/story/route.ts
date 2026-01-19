import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithTemp } from '@/lib/ai';
import { STORY_CODER_PROMPT } from '@/prompts';
import { StoryResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const result = await generateJSONWithTemp<StoryResult>(content, STORY_CODER_PROMPT, 0.9);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Story Error:', error);
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}
