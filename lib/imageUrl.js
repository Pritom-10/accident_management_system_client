
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5000';


export function imageSrc(url) {
  if (!url) return '';


  if (/^(https?:|data:|blob:)/i.test(url)) return url;


  if (/^[a-f0-9]{24}$/i.test(url)) return `${API_ORIGIN}/api/images/${url}`;


  if (url.startsWith('/api/')) return `${API_ORIGIN}${url}`;

  return url;
}