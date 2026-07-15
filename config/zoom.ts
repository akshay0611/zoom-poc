export const zoomConfig = {
  sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY || '',
  sdkSecret: process.env.ZOOM_SDK_SECRET || '',
  meetingNumber: process.env.NEXT_PUBLIC_ZOOM_MEETING_NUMBER || '',
  passcode: process.env.NEXT_PUBLIC_ZOOM_MEETING_PASSCODE || '',
  signatureEndpoint:
    process.env.NEXT_PUBLIC_ZOOM_SIGNATURE_ENDPOINT || '/api/signature',
  teacherName: process.env.NEXT_PUBLIC_ZOOM_TEACHER_NAME || 'Teacher',
  studentName: process.env.NEXT_PUBLIC_ZOOM_STUDENT_NAME || 'Student',
} as const;

export const ROLES = {
  HOST: 1,
  ATTENDEE: 0,
} as const;
