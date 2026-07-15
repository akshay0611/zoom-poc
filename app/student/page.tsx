'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { ROLES } from '@/config/zoom';

const ZoomMeeting = dynamic(() => import('@/components/ZoomMeeting'), {
  ssr: false,
});

type MeetingStatus = 'idle' | 'loading' | 'joined' | 'error';

export default function StudentPage() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>('idle');

  const handleMeetingStatus = useCallback((status: MeetingStatus) => {
    setMeetingStatus(status);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setSubmitted(true);
      setMeetingStatus('loading');
    }
  };

  if (!submitted) {
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
            <h1 className="text-lg font-semibold">Student View</h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Join Meeting as Student
              </h2>
              <p className="text-zinc-400">
                Enter your name to join the meeting
              </p>
            </div>

            <form
              onSubmit={handleJoin}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
            >
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                required
                minLength={1}
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-medium transition-colors"
              >
                Join Meeting
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          {meetingStatus === 'joined' && (
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
          )}
          <h1 className="text-lg font-semibold">Student View</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-medium">
            Participant
          </span>
          <span className="text-zinc-400 text-sm">{name}</span>
        </div>
      </header>

      <main className="flex flex-col flex-1 p-6 gap-6">
        <ZoomMeeting
          userName={name}
          role={ROLES.ATTENDEE}
          onMeetingStatus={handleMeetingStatus}
        />

        {meetingStatus === 'joined' && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="font-medium mb-4">Verification Checklist</h3>
            <div className="space-y-3">
              <VerificationItem
                label="Audio"
                description="Use the microphone button in the Zoom toolbar to test audio"
              />
              <VerificationItem
                label="Video"
                description="Use the camera button in the Zoom toolbar to test video"
              />
              <VerificationItem
                label="Chat"
                description="Open the chat panel from the Zoom toolbar to send messages"
              />
              <VerificationItem
                label="Raise Hand"
                description="Click the Reactions button in the Zoom toolbar, then select Raise Hand"
              />
              <VerificationItem
                label="Screen Share"
                description="View screen shared by the host in the main video area"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function VerificationItem({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full border-2 border-zinc-600 flex items-center justify-center mt-0.5 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-zinc-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
