import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Verdict | Brutal Startup Growth Audit';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020617', // slate-950
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ color: '#ea580c', fontSize: 120, fontWeight: 'bold', marginRight: '20px' }}>V</div>
          <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: '-0.05em' }}>VERDICT</div>
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.4,
          }}
        >
          An autonomous agent that strips away positivity bias to deliver brutally honest, YC-grade landing page teardowns.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
