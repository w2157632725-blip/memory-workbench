import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithTemp } from '@/lib/ai';
import { ATOMIZER_PROMPT } from '@/prompts';
import { KnowledgePoint } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const result = await generateJSONWithTemp<{ points: KnowledgePoint[] }>(text, ATOMIZER_PROMPT, 0.2);

    return NextResponse.json(result.points || []);
  } catch (error) {
    console.error('Atomizer Error:', error);
    return NextResponse.json({ error: 'Failed to process text' }, { status: 500 });
  }
}
