import jwt from 'jsonwebtoken';
import { zoomConfig } from '@/config/zoom';

export interface SignaturePayload {
  signature: string;
  sdkKey: string;
  meetingNumber: string;
  role: number;
}

export function generateSignature(
  meetingNumber: string | number,
  role: number
): string {
  // Backdate iat slightly to tolerate clock skew between server and Zoom
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const payload = {
    appKey: zoomConfig.sdkKey,
    sdkKey: zoomConfig.sdkKey,
    mn: Number(meetingNumber),
    role,
    iat,
    exp,
    // tokenExp must be an absolute Unix timestamp (>= iat + 1800), not a duration
    tokenExp: exp,
  };

  return jwt.sign(payload, zoomConfig.sdkSecret, { algorithm: 'HS256' });
}
