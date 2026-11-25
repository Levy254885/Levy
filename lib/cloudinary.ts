import 'server-only';
import crypto from 'crypto';

/** Accepts the three separate variables, or the single CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD that Cloudinary shows. */
export const cfg = () => {
  const e = process.env;
  let cloud = (e.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || e.CLOUDINARY_CLOUD_NAME || '').trim();
  let key = (e.CLOUDINARY_API_KEY || '').trim();
  let secret = (e.CLOUDINARY_API_SECRET || '').trim();
  const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec((e.CLOUDINARY_URL || '').trim());
  if (m) { key = key || m[1]; secret = secret || m[2]; cloud = cloud || m[3]; }
  return { cloud, key, secret };
};

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
