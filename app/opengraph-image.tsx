import { ImageResponse } from 'next/og';

export const alt = 'kirana counter billing — cash, UPI, udhaar';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at 78% 18%, rgba(255, 107, 0, 0.28), transparent 34%), radial-gradient(circle at 18% 86%, rgba(99, 102, 241, 0.18), transparent 34%), #0A0A0F',
          color: '#EAEAE6',
          padding: 72,
          fontFamily: 'Arial',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: '#FF6B00',
              color: '#0A0A0F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              fontWeight: 900,
            }}
          >
            बोल
          </div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 800 }}>
            <span>Samaan</span>
            <span style={{ color: '#FF6B00' }}>Bol</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 860 }}>
          <div style={{ color: '#FF8A33', fontSize: 34, fontWeight: 700 }}>
            जो बोला, वही बिल।
          </div>
          <div style={{ fontSize: 56, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2 }}>
            You already said it out loud. The bill should keep up.
          </div>
          <div style={{ color: '#C4C4C8', fontSize: 30, lineHeight: 1.35 }}>
            Cash, UPI QR, or udhaar. Stock is not a second notebook.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, color: '#8A8A90', fontSize: 24 }}>
          <span>Kirana counter</span>
          <span>•</span>
          <span>Cash · UPI · Udhaar</span>
          <span>•</span>
          <span>App Store · Google Play</span>
        </div>
      </div>
    ),
    size,
  );
}
