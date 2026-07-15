# How to Get Zoom Credentials

## 1. Create a Zoom App (SDK Key & Secret)

1. Go to **Zoom Marketplace**: https://marketplace.zoom.us/
2. Click **Sign In** (top-right) and log in with your Zoom account
3. Click **Build App** (top-right, next to your profile)
4. Select **Meeting SDK** app type:

   ![Meeting SDK](https://developers.zoom.us/images/en/meeting-sdk/create-app-meeting-sdk-app.png)

5. Click **Create**
6. Fill in the required info:
   - **App Name**: `MBT LMS POC` (or anything)
   - **Company/Developer Name**: your name
   - **Contact Email**: your email
7. Click **Create**
8. Find your credentials on the **App Credentials** tab:

| Field | Where it appears |
|---|---|
| **SDK Key** | `NEXT_PUBLIC_ZOOM_SDK_KEY` |
| **SDK Secret** | `ZOOM_SDK_SECRET` |

   Keep this page open — you'll copy both values.

---

## 2. Get or Create a Meeting Number

**Option A — Use an existing meeting:**
- Open the Zoom desktop app
- Click **Meetings** tab
- Find any recurring meeting you own
- Copy the **Meeting ID** (9-11 digit number)

**Option B — Create a new meeting via Zoom Web:**
1. Go to https://zoom.us/meeting/schedule
2. Fill in topic, date, etc.
3. Under **Security**, set a **Passcode**
4. Click **Save**
5. Copy the **Meeting ID** and **Passcode**

---

## 3. Configure `.env.local`

```env
NEXT_PUBLIC_ZOOM_SDK_KEY=abc123                        # from Step 1
ZOOM_SDK_SECRET=def456                                  # from Step 1
NEXT_PUBLIC_ZOOM_MEETING_NUMBER=123456789               # from Step 2
NEXT_PUBLIC_ZOOM_MEETING_PASSCODE=yourpasscode          # from Step 2
NEXT_PUBLIC_ZOOM_SIGNATURE_ENDPOINT=/api/signature
NEXT_PUBLIC_ZOOM_TEACHER_NAME=Teacher
NEXT_PUBLIC_ZOOM_STUDENT_NAME=Student
```

---

## 4. Enable SDK in Zoom Account

The Meeting SDK requires your Zoom account to allow SDK connections:

1. Go to https://zoom.us/profile/setting
2. Scroll to the **In Meeting (Advanced)** section
3. Enable **Allow use of Meeting SDK to send meeting data**
4. If you don't see this setting, contact your Zoom admin

---

## Quick Checklist

- [ ] SDK Key copied from Zoom Marketplace
- [ ] SDK Secret copied from Zoom Marketplace
- [ ] Meeting ID (9-11 digits)
- [ ] Meeting passcode (if set)
- [ ] `.env.local` created with all values
- [ ] "Allow use of Meeting SDK" enabled in account settings

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `401 Unauthorized` | SDK Key or Secret is wrong — double-check both |
| `Meeting not found` | Meeting ID doesn't exist or is wrong |
| `Invalid passcode` | Passcode is wrong or the meeting doesn't require one |
| `Signature invalid` | Usually means SDK Secret is wrong — check for leading/trailing spaces |
| `Cross-Origin errors` | Make sure COEP/COOP headers are set (already configured in `next.config.ts`) |
| `Cross-origin access blocked` during dev | Add `allowedDevOrigins: ['127.0.0.1', 'localhost']` to `next.config.ts` (already done) |
