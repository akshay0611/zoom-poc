# Zoom Meeting SDK — Evaluation Report

## 1. Development Experience

### Difficulty of Integration
- **Moderate.** The SDK requires server-side JWT generation for meeting signatures, which adds a small backend step.
- The client-side flow (`ZoomMtg.init` → `ZoomMtg.join`) is straightforward but uses callback-based APIs (no Promises) which feels dated.
- Cross-Origin-Embedder-Policy (COEP) headers (`require-corp`) are required for `SharedArrayBuffer`, which can conflict with third-party resources.
- The embedded component API (`EmbeddedClient`) is promise-based but missing some features vs the legacy `ZoomMtg` approach.

### SDK Documentation Quality
- **Adequate but scattered.** The official docs cover the basics but miss edge cases.
- The TypeScript type definitions are comprehensive and helpful.
- Breaking changes between versions are documented but not prominently highlighted.
- Many examples in the docs use outdated code patterns.

### Time Required
- Initial integration: ~2-3 hours
- Full POC (this project): ~4-6 hours
- Production-ready integration with custom UI: 2-4 weeks

---

## 2. UI / Customization

| Aspect | Assessment |
|---|---|
| **Can UI be customized?** | Limited. The SDK renders its own components. Can position the container, hide certain toolbar buttons, and add custom buttons to the "More" menu. |
| **Fixed components** | Main toolbar, participant panel, chat panel, video gallery layout — these are all rendered by Zoom and cannot be replaced. |
| **Configurable components** | Meeting header (show/hide), invite button (show/hide), record button (show/hide), audio panel (default open/closed), video drag, custom toolbar buttons via the "More" dropdown. |
| **Custom branding** | Zoom logo can be hidden (`disableZoomLogo: true`) but there is no white-labeling without the Video SDK. |
| **CSS Override** | The SDK renders into a container div; CSS overrides are fragile and may break with SDK updates. |

---

## 3. Feature Verification

| Feature | Status | Notes |
|---|---|---|
| **Audio** | ✅ | Computer audio (VoIP) and phone call-in supported |
| **Video** | ✅ | Camera on/off, gallery/speaker view |
| **Screen Share** | ✅ | Chrome tab/window/screen sharing; audio tab sharing |
| **Chat** | ✅ | Public and private messaging; file sharing in chat |
| **Participants** | ✅ | Participant list with mute, rename, expel controls |
| **Waiting Room** | ✅ | Host can admit/deny; waiting room UI is built-in |
| **Host Controls** | ✅ | Mute all, expel, lock meeting, end meeting, make co-host |
| **Recording** | ✅ | Cloud recording (with Zoom license); local recording (with token) |
| **Breakout Rooms** | ✅ | Assign, open, close rooms; timer support |
| **Raise Hand** | ✅ | Via toolbar Reactions menu; programmatic API available |
| **Virtual Background** | ✅ | Blur and custom images |
| **Nonverbal Feedback** | ✅ | Speed up/slow down icons |
| **Polling** | ⚠️ | Requires account-level feature flag |
| **Q&A (Webinar)** | ⚠️ | Webinar-only feature |

---

## 4. Performance

### Join Time
- Cold join (first load + WASM download): ~5-10 seconds
- Warm join (cached WASM): ~2-4 seconds
- Time depends on network speed and device capability

### CPU Usage
- Idle in meeting: ~5-10% CPU (modern laptop)
- Video on: ~15-25% CPU
- Screen share active: ~20-35% CPU
- Notable: CPU usage is higher in Chrome vs Firefox

### Memory Usage
- Base meeting: ~150-250 MB
- With video: ~250-400 MB
- With screen share: ~300-500 MB
- WASM compilation adds ~50-100 MB during load (then freed)

### Network Quality
- Built-in QoS monitoring: packet loss, jitter, RTT
- Adaptive bitrate adjusts to network conditions
- Minimum recommended: 2 Mbps down / 1 Mbps up (for video)

---

## 5. Mobile Compatibility

| Platform | Status | Issues |
|---|---|---|
| **Chrome Android** | ⚠️ | Works but performance is lower. UI elements may be small on narrow screens. Video rendering can lag on mid-range devices. |
| **Safari iOS** | ⚠️ | Limited. iOS has restrictions on WebRTC that can cause issues. Audio may work but video performance varies. Apple's browser policies restrict some SDK features. |
| **Chrome iOS** | ⚠️ | Same limitations as Safari iOS (all iOS browsers use WebKit). |

**Key mobile issues:**
- iOS Safari does not support `SharedArrayBuffer` (required for WASM media processing) without specific COOP/COEP headers that can conflict with other site functionality.
- Screen sharing is not supported on mobile browsers.
- The full Zoom Meeting SDK UI does not adapt well to small screens.
- Zoom recommends using native mobile SDKs for production mobile apps.

---

## 6. Known SDK Limitations

### UI Restrictions
1. **Cannot fully customize the meeting UI.** The toolbar, participant panel, and video layout are rendered by Zoom and cannot be replaced with custom React components.
2. **CSS overrides are fragile.** SDK updates can change internal class names and break custom styling.
3. **Limited branding.** Zoom logo can be hidden but no white-label option without Video SDK.

### Customization Limitations
1. Only custom buttons added to the "More" dropdown; cannot reorder or replace toolbar buttons.
2. Cannot change the meeting header to match LMS branding.
3. Video gallery layout cannot be customized beyond gallery/speaker view toggle.
4. Chat panel is embedded and cannot be replaced with a custom chat UI.

### Browser Issues
1. **Mobile browser support is poor.** iOS Safari has significant limitations with WebRTC and SharedArrayBuffer.
2. **Firefox** may have higher CPU usage than Chrome.
3. **Screen sharing requires Chrome/Firefox/Edge** (Safari has limited support).
4. COEP headers (`require-corp`) required for SharedArrayBuffer can cause CORS issues with some third-party resources.

### Authentication Constraints
1. No built-in user authentication; you must implement your own session/auth layer.
2. Meeting signature (JWT) has no user identity — anyone with a valid signature can join.

### Licensing Limitations
1. **Meeting SDK is not free for production.** Requires a Zoom plan (Pro, Business, or Enterprise) for meetings longer than 40 minutes.
2. **Free tier:** 40-minute limit on 1-on-1 and group meetings.
3. **Recording** (cloud) requires a paid Zoom plan.
4. **Bandwidth and storage** costs can add up at scale.

### Technical Constraints
1. React 18.2.0 peer dependency — incompatible with React 19+ (requires `--legacy-peer-deps`).
2. The SDK bundles Redux internally (React-Redux dependency).
3. Large bundle size: the WASM media files add ~5-10 MB to page load.
4. No offline support; requires persistent internet connection.
5. The legacy API returns `ZoomMtg` with a `generateSDKSignature` method that is deprecated; you must implement your own server-side signature generation.

---

## 7. Integration Notes for MBT LMS

### Suitability for MBT LMS MVP
**Conditionally suitable.** The Zoom Meeting SDK can meet the core requirements (live classes, screen sharing, chat, participant management) but with significant caveats:

**Pros:**
- Quick to get basic meetings working
- Feature-rich (breakout rooms, recording, waiting room)
- Zoom brand recognition
- All major features work on desktop Chrome/Firefox/Edge

**Cons:**
- Poor mobile browser experience (iOS especially problematic)
- Limited UI customization — cannot match LMS branding
- Heavy bundle size impacts page load
- React 18 peer dependency conflicts with Next.js 16 / React 19
- Licensing costs at scale
- Users must have Zoom accounts for some features
- Cannot fully embed — SDK takes over the viewport

### Estimated Integration Effort
| Phase | Effort | Details |
|---|---|---|
| Basic meeting join | 2-3 days | Signature endpoint, client component, route setup |
| UI polish & styling | 1-2 weeks | Positioning SDK container, adding custom overlay controls |
| Full feature integration | 2-4 weeks | Recording, breakout rooms, waiting room flow |
| Testing & QA | 1-2 weeks | Cross-browser, mobile, performance |
| **Total** | **4-8 weeks** | For production-ready integration |

### Risks
1. **React 19 compatibility.** The SDK requires React 18.2.0 peer dependency. Using `--legacy-peer-deps` may cause subtle runtime issues.
2. **Mobile strategy gap.** Mobile browsers (iOS Safari) have poor support; native mobile SDKs require separate development.
3. **UI inconsistency.** The Zoom SDK UI looks different from the LMS, which may confuse users.
4. **Cost at scale.** If the LMS grows to hundreds of concurrent meetings, Zoom licensing costs become significant.
5. **Dependency on Zoom.** Any Zoom API changes or outages directly affect the LMS.

### Future Migration Considerations (e.g., LiveKit)
**LiveKit** is a strong alternative for the future:
- **Open source** — no per-user licensing costs
- **Fully customizable UI** — can match LMS branding exactly
- **React-friendly** — modern, no peer dependency issues
- **Self-hosted** — no reliance on third-party service availability
- **Better mobile support** — lighter SDK, better mobile web experience

**Trade-offs when migrating:**
- LiveKit requires self-hosting infrastructure (or paid LiveKit Cloud)
- Fewer built-in features (no breakout rooms, waiting room is DIY)
- No built-in recording (requires additional infrastructure)
- Migration effort: 1-3 months to replace Zoom features

### Overall Recommendation
**Proceed with Zoom Meeting SDK for MVP, but plan for LiveKit migration post-MVP.**

For the MVP, Zoom provides the fastest path to a working solution with minimal custom development. However, the limitations around customization, mobile support, and licensing suggest that a long-term solution should be based on an open-source alternative like LiveKit.

**MVP (Phase 1):** Zoom Meeting SDK
- Basic meeting join/leave (teacher + student)
- Audio, video, screen share, chat
- Host controls (mute, expel, waiting room)

**Post-MVP (Phase 2+):** Evaluate migration to LiveKit
- Custom UI matching LMS branding
- Better mobile experience
- No per-user licensing
- Full control over features and infrastructure

---

## 8. Quick Reference

| Item | Value |
|---|---|
| SDK Version | 6.2.0 |
| Peer Dependencies | React 18.2.0, Redux 4.2.1 |
| Browser Support | Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+ |
| Mobile Support | Limited (native SDK recommended) |
| Required Headers | COEP: require-corp, COOP: same-origin |
| License | MIT (SDK), Paid (Zoom service) |
| Docs | https://developers.zoom.us/docs/meeting-sdk/web/ |
