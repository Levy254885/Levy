import 'server-only';
import crypto from 'crypto';

const cfg = () => ({
  cloud: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
  key: process.env.CLOUDINARY_API_KEY ?? '',
  secret: process.env.CLOUDINARY_API_SECRET ?? '',
});

const sign = (params: Record<string, string | number>) => {
  const str = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(str + cfg().secret).digest('hex');
};

/** Signed parameters so the browser can upload straight to Cloudinary (the secret never leaves the server). */
export function signUpload(folder = 'portfolio') {
  const { cloud, key } = cfg();
  const timestamp = Math.floor(Date.now() / 1000);
  const allowed_formats = 'jpg,jpeg,png,webp,gif';
  return { cloudName: cloud, apiKey: key, timestamp, folder, allowed_formats, signature: sign({ allowed_formats, folder, timestamp }) };
}

export async function destroyImage(publicId?: string | null) {
  if (!publicId) return;
  const { cloud, key } = cfg();
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId, timestamp: String(timestamp), api_key: key, signature: sign({ public_id: publicId, timestamp }),
  });
  try {
    await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: 'POST', body });
  } catch (e) {
    console.error('Cloudinary delete failed', e);
  }
}

export const isCloudinaryUrl = (u: string) => u.startsWith(`https://res.cloudinary.com/${cfg().cloud}/`);
