'use server';

type DOMMatrixLike = new (...args: unknown[]) => unknown;
type PdfParseWorkerModule = typeof import('pdf-parse/worker');

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
    const worker: PdfParseWorkerModule = await import('pdf-parse/worker');
    PDFParse.setWorker(worker.getPath());

    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    await parser.destroy();

    return { text: data.text };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    const message =
      error instanceof Error && error.message
        ? `Failed to parse PDF: ${error.message}`
        : 'Failed to parse PDF';
    return { text: '', error: message };
  }
}
