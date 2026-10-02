import { ImageResponse } from 'next/og';

export const alt = 'Aldreine Vanda Kauntu — Data Analyst';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// OG image 1200×630: kanvas blush, grid tipis, pita aqua di bawah.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px 56px',
          backgroundColor: '#ece2e1',
          backgroundImage:
            'linear-gradient(rgba(35,48,47,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(35,48,47,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          borderBottom: '28px solid #aee1e1',
          color: '#23302f',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 26, letterSpacing: 3, color: '#556563', textTransform: 'uppercase' }}>
            Data Analyst · CS Student (Database)
          </div>
          <div style={{ fontSize: 104, fontFamily: 'serif', lineHeight: 0.95, marginTop: 24, letterSpacing: -4 }}>
            Aldreine Vanda Kauntu
          </div>
          <div style={{ fontSize: 34, color: '#556563', marginTop: 28, maxWidth: 900, lineHeight: 1.35 }}>
            Clean schemas, reliable pipelines, and dashboards that answer real business questions.
          </div>
        </div>
        <div style={{ fontSize: 26, color: '#556563' }}>aldreinevanda.vercel.app</div>
      </div>
    ),
    size,
  );
}
