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
      // Use Zhipu AI GLM-4-Voice for transcription if OPENAI_API_KEY is not available
      // Note: GLM-4-Voice is primarily an end-to-end voice model, but we can try to use it for transcription
      // Or we can use a more standard STT service if Zhipu provides one.
      // Based on documentation, Zhipu has GLM-4-Voice which can handle audio input.
      // However, for pure STT, we might need to check if there's a specific endpoint.
      // Since we don't have a direct STT endpoint in the search results, we'll try to use the chat completion with audio input
      // or fallback to a clear message if that's complex to implement without SDK.
      
      // Attempt to use Zhipu's GLM-4-Voice via OpenAI compatible chat completion with audio url/content if supported
      // But standard STT is usually a separate endpoint.
      // Let's keep the error message but make it more specific about Zhipu's capabilities for now
      // until we implement the exact GLM-4-Voice multi-modal call which is more complex (requires base64 audio in messages).
      
      return NextResponse.json({ 
          error: '语音转文字功能推荐使用 OpenAI API Key (Whisper)。如需使用智谱 GLM-4-Voice 进行语音对话，请等待后续更新支持。',
          isMock: true 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Transcription Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to transcribe audio' }, { status: 500 });
  }
}
