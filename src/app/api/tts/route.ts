import { NextResponse } from 'next/server';

const apiKey = process.env.VOICERSS_API_KEY;

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'VoiceRSS API key is not configured (missing VOICERSS_API_KEY)' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      key: apiKey,
      hl: 'en-gb',
      src: text,
      c: 'MP3',
      f: '44khz_16bit_stereo',
      v: 'Harry'
    });

    const upstream = await fetch(`https://api.voicerss.org/?${params.toString()}`);

    const contentType = upstream.headers.get('content-type') ?? '';

    if (!upstream.ok || contentType.startsWith('text')) {
      const errText = await upstream.text();
      console.error('VoiceRSS upstream error', upstream.status, errText);
      return NextResponse.json(
        { error: 'Failed to generate audio from VoiceRSS' },
        { status: 502 }
      );
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('TTS route error', error);
    return NextResponse.json(
      {
        error: 'Unexpected error in TTS route',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
