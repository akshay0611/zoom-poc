'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { zoomConfig, ROLES } from '@/config/zoom';

const ZOOM_VERSION = '6.2.0';
const CDN_BASE = `https://source.zoom.us/${ZOOM_VERSION}/lib`;
const SDK_BASE = `https://source.zoom.us/${ZOOM_VERSION}`;

const VENDOR_SCRIPTS = [
  'vendor/react.min.js',
  'vendor/react-dom.min.js',
  'vendor/react-redux.min.js',
  'vendor/redux.min.js',
  'vendor/redux-thunk.min.js',
];

const SDK_SCRIPT = `zoom-meeting-${ZOOM_VERSION}.min.js`;

type MeetingStatus = 'idle' | 'loading' | 'joined' | 'error';

interface ZoomMeetingProps {
  userName: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  onMeetingStatus?: (status: MeetingStatus) => void;
}

let sdkLoadingPromise: Promise<void> | null = null;

function getZoomMtg() {
  return (window as unknown as { ZoomMtg: ZoomMtg }).ZoomMtg;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureSDKLoaded(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (getZoomMtg()) return;

  if (!sdkLoadingPromise) {
    sdkLoadingPromise = (async () => {
      for (const vendor of VENDOR_SCRIPTS) {
        await loadScript(`${CDN_BASE}/${vendor}`);
      }
      await loadScript(`${SDK_BASE}/${SDK_SCRIPT}`);
    })();
  }
  return sdkLoadingPromise;
}

function decodeJWTPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function formatZoomError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const parts = [e.errorCode, e.errorMessage ?? e.reason ?? e.result]
      .filter(Boolean)
      .map(String);
    if (parts.length) return parts.join(' - ');
    try {
      return JSON.stringify(err);
    } catch {}
  }
  return String(err);
}

export default function ZoomMeeting({
  userName,
  role,
  onMeetingStatus,
}: ZoomMeetingProps) {
  const [status, setStatus] = useState<MeetingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  // Zoom renders its own full-page UI (incl. the pre-join preview) once init
  // succeeds — hide our loading overlay from that point so it can't cover it.
  const [sdkUIReady, setSdkUIReady] = useState(false);
  const joinedRef = useRef(false);
  const initStartedRef = useRef(false);
  const isMountedRef = useRef(false);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateStatus = useCallback(
    (newStatus: MeetingStatus) => {
      setStatus(newStatus);
      onMeetingStatus?.(newStatus);
    },
    [onMeetingStatus]
  );

  useEffect(() => {
    if (!zoomConfig.sdkKey || !zoomConfig.meetingNumber) {
      const timer = setTimeout(() => {
        setError('SDK Key or Meeting Number not configured');
        updateStatus('error');
      });
      return () => clearTimeout(timer);
    }

    if (joinedRef.current) return;

    isMountedRef.current = true;

    const run = async () => {
      try {
        console.log('[Zoom Debug] NEXT_PUBLIC_ZOOM_SDK_KEY:', process.env.NEXT_PUBLIC_ZOOM_SDK_KEY);
        console.log('[Zoom Debug] zoomConfig.sdkKey:', zoomConfig.sdkKey);
        console.log('[Zoom Debug] zoomConfig.meetingNumber:', zoomConfig.meetingNumber);
        console.log('[Zoom Debug] role:', role);

        updateStatus('loading');

        await ensureSDKLoaded();

        if (!isMountedRef.current) return;

        const ZoomMtg = getZoomMtg();

        ZoomMtg.setZoomJSLib(CDN_BASE, '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        const updateParticipantCount = () => {
          ZoomMtg.getAttendeeslist({
            success: (res: unknown) => {
              // SDK returns { result: { attendeesList: [...] } }, not an array
              const list = (
                res as { result?: { attendeesList?: unknown[] } }
              )?.result?.attendeesList;
              if (Array.isArray(list)) {
                setParticipantCount(list.length);
              }
            },
          });
        };

        ZoomMtg.inMeetingServiceListener('onUserJoin', updateParticipantCount);
        ZoomMtg.inMeetingServiceListener(
          'onUserLeave',
          updateParticipantCount
        );

        const sigRes = await fetch(zoomConfig.signatureEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingNumber: zoomConfig.meetingNumber,
            role,
          }),
        });

        if (!sigRes.ok) throw new Error('Failed to get signature');
        const { signature } = await sigRes.json();

        const decodedPayload = decodeJWTPayload(signature);
        console.log('[Zoom Debug] JWT payload:', decodedPayload);

        if (!isMountedRef.current) return;

        if (initStartedRef.current) {
          console.warn('[Zoom Debug] init already started, skipping duplicate');
          return;
        }
        initStartedRef.current = true;

        const initConfig = {
          leaveUrl: window.location.origin,
          patchJsMedia: true,
          disableCORP: !window.crossOriginIsolated,
          webEndpoint: 'zoom.us',
          externalLinkPage: `${SDK_BASE}/externalLinkPage.html`,
        };
        console.log('[Zoom Debug] INIT_CONFIG:', initConfig);

        ZoomMtg.i18n.load('en-US');
        ZoomMtg.i18n.onLoad(() => {
          if (!isMountedRef.current) return;

          ZoomMtg.init({
            ...initConfig,
            success: () => {
              if (!isMountedRef.current) return;
              console.log('[Zoom Debug] init success');
              // Zoom's own pre-join UI takes over from here
              setSdkUIReady(true);
              const joinConfig = {
                sdkKey: zoomConfig.sdkKey,
                meetingNumber: Number(zoomConfig.meetingNumber),
                userName,
                passWord: zoomConfig.passcode,
                signature,
              };
              console.log('[Zoom Debug] JOIN_CONFIG:', joinConfig);

              joinTimeoutRef.current = setTimeout(() => {
                if (joinedRef.current || !isMountedRef.current) return;
                console.warn('[Zoom Debug] join timed out after 15s');
                try {
                  console.warn(
                    '[Zoom Debug] checkSystemRequirements:',
                    ZoomMtg.checkSystemRequirements()
                  );
                } catch {}
              }, 15000);

              ZoomMtg.join({
                ...joinConfig,
                success: () => {
                  if (joinTimeoutRef.current) {
                    clearTimeout(joinTimeoutRef.current);
                    joinTimeoutRef.current = null;
                  }
                  if (!isMountedRef.current) return;
                  if (joinedRef.current) return;
                  joinedRef.current = true;
                  console.log('[Zoom Debug] join success');
                  updateStatus('joined');
                },
                error: (joinError: unknown) => {
                  if (joinTimeoutRef.current) {
                    clearTimeout(joinTimeoutRef.current);
                    joinTimeoutRef.current = null;
                  }
                  if (!isMountedRef.current) return;
                  const msg = formatZoomError(joinError);
                  console.log('[Zoom Debug] join error:', joinError);
                  setSdkUIReady(false);
                  setError(`Join failed: ${msg}`);
                  updateStatus('error');
                },
              });
            },
            error: (initError: unknown) => {
              if (!isMountedRef.current) return;
              const msg = formatZoomError(initError);
              console.log('[Zoom Debug] init error:', initError);
              setError(`Init failed: ${msg}`);
              updateStatus('error');
            },
          });
        });
      } catch (err) {
        if (!isMountedRef.current) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        updateStatus('error');
      }
    };

    run();

    return () => {
      isMountedRef.current = false;
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
      try {
        if (joinedRef.current) {
          const ZoomMtg = getZoomMtg();
          if (ZoomMtg) {
            ZoomMtg.leaveMeeting({ confirm: false });
          }
        }
      } catch {}
    };
  }, [userName, role, updateStatus]);

  return (
    <div className="flex flex-col flex-1">
      <div
        id="zoom-meeting-container"
        className="flex-1 relative min-h-[600px] bg-black rounded-lg overflow-hidden"
      >
        {status === 'loading' && !sdkUIReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Joining meeting...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-center max-w-md px-6">
              <div className="text-red-500 text-5xl mb-4">!</div>
              <p className="text-red-400 text-lg font-semibold mb-2">
                Failed to join meeting
              </p>
              <p className="text-gray-400 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {status === 'joined' && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-sm text-gray-400 rounded-b-lg">
          <span>
            Status:
            <span className="text-green-400 ml-1">Connected</span>
          </span>
          <span>
            Participants:
            <span className="text-white ml-1">{participantCount}</span>
          </span>
          <span>
            Role:
            <span className="text-blue-400 ml-1 capitalize">
              {role === ROLES.HOST ? 'Host' : 'Participant'}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
