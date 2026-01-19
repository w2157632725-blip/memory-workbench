import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithTemp } from '@/lib/ai';
import { FEYNMAN_PROMPT } from '@/prompts';
import { FeynmanFeedback } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { concept, userExplanation } = await req.json();

    if (!concept || !userExplanation) {
      return NextResponse.json({ error: 'Concept and User Explanation are required' }, { status: 400 });
    }

    const prompt = `Standard Truth: ${concept}\nUser Input: ${userExplanation}`;
    const result = await generateJSONWithTemp<FeynmanFeedback>(prompt, FEYNMAN_PROMPT, 0.4);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Feynman Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate explanation' }, { status: 500 });
  }
}
