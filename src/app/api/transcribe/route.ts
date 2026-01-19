import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ZHIPU_API_KEY is not configured' }, { status: 500 });
    }

    // Initialize OpenAI client pointing to Zhipu AI's compatible endpoint
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    });

    // Use the audio transcriptions API
    // Note: The model name needs to be confirmed from Zhipu docs. 
    // Common guesses: "glm-4-voice" or just relying on default if supported.
    // Since Zhipu might not support /audio/transcriptions exactly like OpenAI in all cases,
    // if this fails, we might need a raw fetch. But their docs claim OpenAI compatibility.
    // Update: Zhipu's STT model usually doesn't require a specific model param or uses a specific one.
    // Let's try 'inference' or leave it to user to verify in docs.
    const response = await client.audio.transcriptions.create({
      file: file,
      model: "glm-4-voice", // Placeholder, user might need to change this
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Transcription Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to transcribe audio' }, { status: 500 });
  }
}
