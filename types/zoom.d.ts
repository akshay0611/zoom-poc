interface ZoomMtgI18n {
  load(lang: string): Promise<Record<string, string>>;
  onLoad(callback: () => void): void;
  getAll(lang?: string): Record<string, string>;
}

interface ZoomMtg {
  setZoomJSLib(path: string, dir: string): void;
  preLoadWasm(): void;
  prepareWebSDK(
    origintrials?: string[],
    webim?: string,
    jsmedia?: string
  ): void;
  checkSystemRequirements(): object;
  i18n: ZoomMtgI18n;
  init(args: {
    leaveUrl: string;
    disableCORP?: boolean;
    webEndpoint?: string;
    externalLinkPage?: string;
    patchJsMedia?: boolean;
    success?: () => void;
    error?: (err: unknown) => void;
  }): void;
  join(args: {
    sdkKey?: string;
    meetingNumber: string | number;
    userName: string;
    passWord?: string;
    signature: string;
    userEmail?: string;
    success?: (res?: unknown) => void;
    error?: (res?: unknown) => void;
  }): void;
  leaveMeeting(args: { confirm: boolean }): void;
  getAttendeeslist(args: {
    success?: (list: unknown) => void;
    error?: (err: unknown) => void;
  }): void;
  inMeetingServiceListener(
    event: string,
    callback: (...args: unknown[]) => void
  ): void;
}

interface Window {
  ZoomMtg: ZoomMtg;
}
