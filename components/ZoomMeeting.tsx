'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomMtg } from '@zoom/meetingsdk';
import { zoomConfig, ROLES } from '@/config/zoom';

ZoomMtg.setZoomJSLib('https://source.zoom.us/3.12.0/lib', '/av');

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

type MeetingStatus = 'idle' | 'loading' | 'joined' | 'error';

interface ZoomMeetingProps {
  userName: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  onMeetingStatus?: (status: MeetingStatus) => void;
}

export default function ZoomMeeting({
  userName,
  role,
  onMeetingStatus,
}: ZoomMeetingProps) {
  const meetingRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MeetingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const initCalledRef = useRef(false);

  const updateStatus = useCallback(
    (newStatus: MeetingStatus) => {
      setStatus(newStatus);
      onMeetingStatus?.(newStatus);
    },
    [onMeetingStatus]
  );

  useEffect(() => {
    if (!zoomConfig.sdkKey || !zoomConfig.meetingNumber) {
      setTimeout(() => {
        setError('SDK Key or Meeting Number not configured');
        updateStatus('error');
      });
      return;
    }

    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const joinMeeting = async () => {
      try {
        updateStatus('loading');

        const signatureRes = await fetch(zoomConfig.signatureEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingNumber: zoomConfig.meetingNumber,
            role,
          }),
        });

        if (!signatureRes.ok) {
          throw new Error('Failed to get signature from server');
        }

        const { signature } = await signatureRes.json();

        ZoomMtg.init({
          leaveUrl: window.location.origin,
          success: () => {
            ZoomMtg.join({
              meetingNumber: zoomConfig.meetingNumber,
              userName,
              passWord: zoomConfig.passcode,
              signature,
              sdkKey: zoomConfig.sdkKey,
              success: () => {
                updateStatus('joined');
              },
              error: (joinError: unknown) => {
                const msg =
                  joinError instanceof Error
                    ? joinError.message
                    : String(joinError);
                setError(`Join failed: ${msg}`);
                updateStatus('error');
              },
            });
          },
          error: (initError: unknown) => {
            const msg =
              initError instanceof Error
                ? initError.message
                : String(initError);
            setError(`Init failed: ${msg}`);
            updateStatus('error');
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        updateStatus('error');
      }
    };

    joinMeeting();

    ZoomMtg.inMeetingServiceListener('onUserJoin', () => {
      ZoomMtg.getAttendeeslist({
        success: (list: unknown) => {
          if (Array.isArray(list)) {
            setParticipantCount(list.length);
          }
        },
      });
    });

    ZoomMtg.inMeetingServiceListener('onUserLeave', () => {
      ZoomMtg.getAttendeeslist({
        success: (list: unknown) => {
          if (Array.isArray(list)) {
            setParticipantCount(list.length);
          }
        },
      });
    });

    return () => {
      try {
        ZoomMtg.leaveMeeting({ confirm: false });
      } catch {
      }
    };
  }, [userName, role, updateStatus]);

  return (
    <div className="flex flex-col flex-1">
      <div
        ref={meetingRef}
        id="zoom-meeting-container"
        className="flex-1 relative min-h-[600px] bg-black rounded-lg overflow-hidden"
      >
        {status === 'loading' && (
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
