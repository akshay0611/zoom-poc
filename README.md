# Zoom Meeting SDK — Proof of Concept

Evaluating the Zoom Meeting SDK for integration into the MBT LMS MVP.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                         │
│  ┌──────────────┐       ┌────────────────────┐   │
│  │  Landing Page │------>│  Teacher / Student  │   │
│  │  / (page.tsx) │       │  Meeting Pages      │   │
│  └──────────────┘       └──────────┬─────────┘   │
│                                     │             │
│                            ┌────────▼────────┐   │
│                            │  ZoomMeeting     │   │
│                            │  Component       │   │
│                            │  (ZoomMtg SDK)   │   │
│                            └────────┬────────┘   │
│                                     │             │
└─────────────────────────────────────┼─────────────┘
                                      │
              ┌───────────────────────┼───────────┐
              │         Next.js Server            │
              │  ┌───────────────────▼────────┐   │
              │  │  /api/signature            │   │
              │  │  (Generates JWT via        │   │
              │  │   jsonwebtoken)            │   │
              │  └────────────────────────────┘   │
              └───────────────────────────────────┘
                                      │
                            ┌─────────▼──────────┐
                            │   Zoom Meeting SDK  │
                            │   Services (Cloud)  │
                            └────────────────────┘
```

## Prerequisites

- Node.js 20+
- npm
- Zoom Meeting SDK account with an app created in the [Zoom Marketplace](https://marketplace.zoom.us/)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Fill in your Zoom credentials in .env.local
#    Get SDK Key and Secret from your Zoom Marketplace app
#    (Apps > [Your App] > App Credentials)

# 4. Run the development server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_ZOOM_SDK_KEY` | SDK Key from Zoom Marketplace |
| `ZOOM_SDK_SECRET` | SDK Secret from Zoom Marketplace |
| `NEXT_PUBLIC_ZOOM_MEETING_NUMBER` | Meeting ID to join |
| `NEXT_PUBLIC_ZOOM_MEETING_PASSCODE` | Meeting passcode |
| `NEXT_PUBLIC_ZOOM_SIGNATURE_ENDPOINT` | API route for signature (default: `/api/signature`) |
| `NEXT_PUBLIC_ZOOM_TEACHER_NAME` | Display name for teacher |
| `NEXT_PUBLIC_ZOOM_STUDENT_NAME` | Default display name for student |

## Usage

1. Open `http://localhost:3000`
2. Click **Join as Teacher** to host a meeting — **the teacher must join first** (otherwise students get error 3008 "meeting not started", unless the meeting has "join before host" enabled)
3. Click **Join as Student** to join as a participant
4. Verify audio, video, chat, screen share, and raise hand

> **Note:** The meeting must already exist in Zoom (this POC uses a fixed meeting ID from `.env.local`). The Meeting SDK cannot create meetings — see `EVALUATION.md` §6.

## Troubleshooting

- **Stuck on "Joining meeting..." forever** — almost always a bad signature. Common causes: `tokenExp` set to a duration instead of an absolute Unix timestamp, clock skew, or SDK key/secret mismatch. The signature JWT payload is logged to the browser console (`[Zoom Debug] JWT payload`) for inspection.
- **Error 3008** — meeting not started; join as teacher (host) first.
- **Error 3712 / signature invalid** — check SDK key/secret pair and that the meeting belongs to the same Zoom account as the Marketplace app.

## Project Structure

```
├── app/
│   ├── api/signature/route.ts    # Backend signature endpoint
│   ├── teacher/page.tsx           # Teacher meeting page
│   ├── student/page.tsx           # Student join & meeting page
│   └── page.tsx                   # Landing page
├── components/
│   └── ZoomMeeting.tsx            # Shared Zoom SDK component
├── config/
│   └── zoom.ts                    # Zoom configuration
├── lib/
│   └── zoom-signature.ts          # Server-side JWT generation
└── EVALUATION.md                  # Full evaluation report
```

## SDK Version

- Zoom Meeting SDK (Client View): `6.2.0` — **loaded via CDN** (`source.zoom.us`), not npm, to avoid the SDK's React 18 peer-dependency conflict with React 19
- Next.js: `16.2.10`
- React: `19.2.4`
