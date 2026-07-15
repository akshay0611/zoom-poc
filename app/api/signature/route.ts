import { NextRequest, NextResponse } from 'next/server';
import { generateSignature } from '@/lib/zoom-signature';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingNumber, role } = body;

    if (!meetingNumber) {
      return NextResponse.json(
        { error: 'meetingNumber is required' },
        { status: 400 }
      );
    }

    const signature = generateSignature(
      meetingNumber,
      typeof role === 'number' ? role : 0
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Signature generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
