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

    // Initialize OpenAI client pointing to OpenAI (for Whisper) or check if Zhipu supports STT.
    // NOTE: Zhipu AI currently does NOT support the standard OpenAI /audio/transcriptions endpoint directly via their GLM-4 API.
    // For reliable STT (Speech to Text), we should use OpenAI's Whisper if available, or a specific Zhipu endpoint if they released one.
    // Assuming user might have OPENAI_API_KEY for this, or we fallback to a mock/error if Zhipu is the only one.
    
    // For this fix, let's try to use OpenAI if available, otherwise return a clear error that Zhipu STT is not supported yet via this SDK.
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey) {
      const client = new OpenAI({ apiKey: openaiKey });
      const response = await client.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });
      return NextResponse.json({ text: response.text });
    } else {
        // Fallback: If only Zhipu Key is present, we try to use a mock response or specific fetch if known.
        // Currently Zhipu's OpenAI compatibility layer focuses on Chat Completions.
        // Let's return a friendly error or a mock for testing.
        return NextResponse.json({ 
            error: '语音转文字功能目前仅支持 OpenAI API Key。智谱 AI 暂未通过此接口提供语音识别服务。',
            isMock: true 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Transcription Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to transcribe audio' }, { status: 500 });
  }
}
