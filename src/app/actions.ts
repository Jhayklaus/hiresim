'use server';

type DOMMatrixLike = new (...args: unknown[]) => unknown;

async function parsePdfWithPdf2Json(buffer: Buffer): Promise<string> {
  const pdf2jsonModule = (await import('pdf2json')) as unknown as {
    default: new (...args: unknown[]) => {
      on: (event: string, cb: (data: unknown) => void) => void;
      parseBuffer: (buffer: Buffer) => void;
      getRawTextContent: () => string;
    };
  };

  const PDFParser = pdf2jsonModule.default;
  const pdfParser = new PDFParser(undefined, 1);

  const text = await new Promise<string>((resolve, reject) => {
    pdfParser.on('pdfParser_dataError', (errData: unknown) => {
      reject(errData);
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const raw = pdfParser.getRawTextContent();
        resolve(raw);
      } catch (e) {
        reject(e);
      }
    });

    pdfParser.parseBuffer(buffer);
  });

  return text;
}

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

    const text = await parsePdfWithPdf2Json(buffer);

    return { text };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    const message =
      error instanceof Error && error.message
        ? `Failed to parse PDF: ${error.message}`
        : 'Failed to parse PDF';
    return { text: '', error: message };
  }
}
