import jwt from 'jsonwebtoken';
import { zoomConfig } from '@/config/zoom';

export interface SignaturePayload {
  signature: string;
  sdkKey: string;
  meetingNumber: string;
  role: number;
}

export function generateSignature(
  meetingNumber: string,
  role: number
): string {
  const iat = Math.round(new Date().getTime() / 1000);
  const exp = iat + 60 * 60 * 2;

  const payload = {
    appKey: zoomConfig.sdkKey,
    sdkKey: zoomConfig.sdkKey,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  };

  return jwt.sign(payload, zoomConfig.sdkSecret, { algorithm: 'HS256' });
}
