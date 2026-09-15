import { ImageResponse } from 'next/og';

export const alt = 'voice POS / kirana billing';
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
            बिल मत टाइप करो। बोलो।
          </div>
          <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2 }}>
            Don't type the bill. Say it.
          </div>
          <div style={{ color: '#C4C4C8', fontSize: 30, lineHeight: 1.35 }}>
            Voice billing for kirana — cash, UPI QR, udhaar. Free tap POS on the App Store.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, color: '#8A8A90', fontSize: 24 }}>
          <span>Voice POS</span>
          <span>•</span>
          <span>Kirana billing</span>
          <span>•</span>
          <span>App Store</span>
        </div>
      </div>
    ),
    size,
  );
}
