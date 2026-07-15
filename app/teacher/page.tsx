'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { zoomConfig, ROLES } from '@/config/zoom';

const ZoomMeeting = dynamic(() => import('@/components/ZoomMeeting'), {
  ssr: false,
});

type MeetingStatus = 'idle' | 'loading' | 'joined' | 'error';

export default function TeacherPage() {
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>('idle');

  const handleMeetingStatus = useCallback((status: MeetingStatus) => {
    setMeetingStatus(status);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Teacher View</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-medium">
            Host
          </span>
          <span className="text-zinc-400 text-sm">
            {zoomConfig.teacherName}
          </span>
        </div>
      </header>

      <main className="flex flex-col flex-1 p-6 gap-6">
        {meetingStatus === 'idle' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-3">
                Ready to Host
              </h2>
              <p className="text-zinc-400 mb-8">
                Click below to join the meeting as the host. You will have full
                control over the session.
              </p>
              <button
                onClick={() =>
                  setMeetingStatus('loading')
                }
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Start Meeting
              </button>
            </div>
          </div>
        )}

        {(meetingStatus === 'loading' ||
          meetingStatus === 'joined' ||
          meetingStatus === 'error') && (
          <ZoomMeeting
            userName={zoomConfig.teacherName}
            role={ROLES.HOST}
            onMeetingStatus={handleMeetingStatus}
          />
        )}

        {meetingStatus === 'joined' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
              }
              title="Audio"
              description="Microphone and speaker controls available in the Zoom toolbar"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              }
              title="Video"
              description="Camera controls available in the Zoom toolbar"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
                  />
                </svg>
              }
              title="Screen Share"
              description="Share your screen via the Zoom toolbar"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              }
              title="Chat & Participants"
              description="Chat and participant panel available in the Zoom UI"
            />
          </div>
        )}
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-3 text-zinc-300">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
