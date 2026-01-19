import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithTemp } from '@/lib/ai';
import { SORTER_PROMPT } from '@/prompts';
import { SorterResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    // Convert items to a string representation for the prompt
    const itemsStr = JSON.stringify(items);
    const result = await generateJSONWithTemp<SorterResult>(itemsStr, SORTER_PROMPT, 0.3);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sorter Error:', error);
    return NextResponse.json({ error: 'Failed to sort items' }, { status: 500 });
  }
}
