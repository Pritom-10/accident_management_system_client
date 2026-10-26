import { ImageResponse } from 'next/og';

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 50" fill="none"><defs><linearGradient id="g" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#F43F5E"/><stop offset="1" stop-color="#4F46E5"/></linearGradient></defs><ellipse cx="24" cy="46" rx="12" ry="2.6" stroke="#4F46E5" stroke-opacity=".35" stroke-width="1.2"/><ellipse cx="24" cy="46" rx="6" ry="1.4" fill="#4F46E5" fill-opacity=".28"/><path d="M24 3C15.2 3 8 10 8 18.6 8 29.5 24 44 24 44s16-14.5 16-25.4C40 10 32.8 3 24 3Z" fill="url(#g)"/><rect x="21.5" y="11" width="5" height="15" rx="1.6" fill="#fff"/><rect x="16.5" y="16" width="15" height="5" rx="1.6" fill="#fff"/></svg>';

const LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`;
const SIZES = [180, 192, 512];

export async function GET(request, { params }) {
  const { size: raw } = await params;
  const size = Number(raw);
  if (!SIZES.includes(size)) return new Response('Not found', { status: 404 });

  const maskable = new URL(request.url).searchParams.get('m') === '1';
  const height = Math.round(size * (maskable ? 0.5 : 0.66));
  const width = Math.round((height * 48) / 50);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF1F2, #E0E7FF)',
        }}
      >
        <img src={LOGO} width={width} height={height} alt="" />
      </div>
    ),
    { width: size, height: size, headers: { 'Cache-Control': 'public, max-age=86400' } }
  );
}