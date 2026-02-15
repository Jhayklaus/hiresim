import { ImageResponse } from 'next/og';
import { BrainCircuit } from 'lucide-react';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#4f46e5', // indigo-600
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          borderRadius: '8px', // rounded-xl scaled for 32px
        }}
      >
        <BrainCircuit 
          size={20} 
          color="#FFFFFF" 
          strokeWidth={2}
        />
      </div>
    ),
    {
      // For convenience, we can re-use the exported icons size metadata
      ...size,
    }
  );
}
