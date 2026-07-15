import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl w-full text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Zoom Meeting SDK
          </h1>
        </div>
        <p className="text-zinc-400 text-lg">
          Proof of Concept — Evaluating Zoom Meeting SDK for MBT LMS
          integration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <Link
          href="/teacher"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-blue-500/50 hover:bg-zinc-900 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-blue-600/20 flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
              <svg
                className="w-7 h-7 text-blue-400"
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
            <h2 className="text-2xl font-semibold mb-3">Join as Teacher</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Create and host a meeting with full controls: camera, microphone,
              screen share, chat, and participant management.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-600/10 text-blue-400 text-xs font-medium">
                Host Controls
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-600/10 text-blue-400 text-xs font-medium">
                Screen Share
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-600/10 text-blue-400 text-xs font-medium">
                Recording
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/student"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-emerald-500/50 hover:bg-zinc-900 hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-emerald-600/20 flex items-center justify-center mb-6 group-hover:bg-emerald-600/30 transition-colors">
              <svg
                className="w-7 h-7 text-emerald-400"
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
            <h2 className="text-2xl font-semibold mb-3">Join as Student</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Join an existing meeting, test audio/video, participate in chat,
              raise hand, and view shared screens.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-600/10 text-emerald-400 text-xs font-medium">
                Audio/Video
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-600/10 text-emerald-400 text-xs font-medium">
                Chat
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-600/10 text-emerald-400 text-xs font-medium">
                Raise Hand
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-16 text-center text-zinc-600 text-xs">
        Zoom Meeting SDK v6.2.0 &middot; Next.js &middot; TypeScript &middot;
        Tailwind CSS
      </div>
    </div>
  );
}
