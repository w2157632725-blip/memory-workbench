import { NextRequest, NextResponse } from 'next/server';
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      text = data.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.type.startsWith('image/')) {
      // For images, we need to recognize text
      const { data: { text: ocrText } } = await Tesseract.recognize(
        buffer,
        'chi_sim+eng', // Chinese Simplified + English
        { logger: m => console.log(m) }
      );
      text = ocrText;
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    console.error('File parsing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse file' }, { status: 500 });
  }
}
