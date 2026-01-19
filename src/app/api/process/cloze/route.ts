import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithTemp } from '@/lib/ai';
import { CLOZE_PROMPT } from '@/prompts';
import { ClozeItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const result = await generateJSONWithTemp<{ items: ClozeItem[] }>(content, CLOZE_PROMPT, 0.2);

    return NextResponse.json(result.items || []);
  } catch (error: any) {
    console.error('Cloze Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate cloze items',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
