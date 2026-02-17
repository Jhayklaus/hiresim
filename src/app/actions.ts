'use server';

type DOMMatrixLike = new (...args: unknown[]) => unknown;

export async function parseCV(formData: FormData): Promise<{ text: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { text: '', error: 'No file uploaded' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const globalWithDOMMatrix = globalThis as unknown as {
      DOMMatrix?: DOMMatrixLike;
    };

    if (!globalWithDOMMatrix.DOMMatrix) {
      const { default: DOMMatrixPolyfill } = await import('@thednp/dommatrix');
      globalWithDOMMatrix.DOMMatrix = DOMMatrixPolyfill as DOMMatrixLike;
    }

    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    await parser.destroy();

    return { text: data.text };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return { text: '', error: 'Failed to parse PDF' };
  }
}
