'use server';

import { PDFParse } from 'pdf-parse';

export async function parseCV(formData: FormData): Promise<{ text: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { text: '', error: 'No file uploaded' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    return { text: data.text };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return { text: '', error: 'Failed to parse PDF' };
  }
}
