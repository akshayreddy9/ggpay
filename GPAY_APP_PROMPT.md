# Build Prompt: UPI Payments App (GPay-style) + Admin Panel — College Project

## Your role
You are a senior full-stack mobile developer. Build a complete, working, polished **UPI-style payments app for Android** that closely follows the screens, flows, animations and features of Google Pay, plus a **web Admin Panel** that has full control over the app. This is a **college project / simulation** — no real money moves; all balances and transactions live in our own database.

I have attached a **screen-recording video** of the real app. Treat it as the primary reference:
- Go through the video screen by screen and recreate each screen's layout, spacing, colours, icons, typography, bottom sheets, transitions and animations as closely as possible.
- Before coding, write a short list of every screen and flow you saw in the video, and confirm each one is in your plan.
- If something in the video conflicts with this document, follow the video for UI and this document for features/architecture.

## Branding (important)
- App name: **PayNova** (or another original name), with an original logo. Do **not** use the Google / Google Pay name, logo or trademarks.
- Keep the same *style*: clean white Material 3 UI, Google-like colour accents (blue #1A73E8, green, yellow, red), rounded cards, circular contact avatars, the same layout.
- Put a small, subtle "Demo" badge on the payment-success screen and in the transaction receipt (marks it as a simulation).

## Tech stack (keep it simple, must run on a real Android phone)
- **Mobile app:** Flutter (latest stable, Material 3, null-safety), with build output as an installable **APK** (`flutter build apk --release`).
- **Backend / database:** Firebase: Authentication, Cloud Firestore (real-time), Firebase Storage (profile photos, banners), Cloud Messaging (notifications).
- **Admin panel:** React + Vite + Tailwind (or plain HTML/JS if simpler), connected to the same Firebase project, deployable on Firebase Hosting. Admin login with an `admin` role check (Firestore security rules + custom claim or `admins` collection).
- Because the app and admin panel share Firestore, **any change made in the admin panel must show up in the app instantly** (use real-time listeners, not one-off fetches).
- State management: Provider or Riverpod. Clean folder structure (`screens/`, `widgets/`, `models/`, `services/`).

## Mobile app — features & screens

### 1. Onboarding & auth
- Splash screen with logo animation.
- Language selection, then enter mobile number.
- OTP verification (Firebase Phone Auth, *or* a demo OTP mode the admin can switch on, e.g. OTP `123456`).
- Choose a Google-style account / enter name and email; profile photo upload.
- Bank-account linking flow: pick bank from a list (logos), "SMS verification" animation, accounts found, select account.
- **Set UPI PIN** (4 or 6 digits, custom numeric keypad as in video); PIN stored hashed.
- Optional app lock (device biometrics / screen lock).

### 2. Home screen (match the video exactly)
- Top: search bar ("Pay friends and merchants"), profile avatar → profile.
- Promotional banner carousel (controlled from admin).
- Action grid: **Scan any QR code, Pay contacts, Pay phone number, Bank transfer, Pay UPI ID or number, Self transfer, Pay bills, Mobile recharge**.
- UPI ID shown under the grid ("UPI ID: name@paynova").
- **People** section: recent contacts as circular avatars, "More" expands.
- **Businesses** section, **Bills & recharges**, **Promotions / Offers & rewards** row.
- **Manage your money**: Check balance, See transaction history, Rewards, Offers, Refer.
- Bottom quick links as shown in the video.

### 3. Payment flows
- **Scan QR:** camera scanner (`mobile_scanner`), upload QR from gallery, torch toggle. Parse UPI QR strings (`upi://pay?pa=...&pn=...&am=...`). Also "Show my QR" tab.
- **Pay contact / phone / UPI ID:** search, verify recipient name ("Banking name: …"), then the pay screen.
- **Pay screen:** recipient avatar + name, large amount input, "Add a note", choose bank account (bottom sheet showing balance-less bank list), Pay button.
- **UPI PIN screen:** bank name and amount header, masked PIN input, custom keypad, same look as the video.
- **Processing → Success animation:** animated tick (Lottie), amount, recipient, date/time, UPI transaction ID, and a success sound. Also **Failed** and **Pending** states.
- **Receipt / transaction details:** status, amount, to/from, UPI ID, transaction ID, Google-style "Paid via", share receipt as image, "Having issues?" option.
- **Chat-style payment thread per contact** (like the video): bubbles for paid/received/requested, with "Pay" and "Request" buttons at the bottom.
- **Request money**, accept/decline incoming requests.
- **Bank transfer** (account number + IFSC + name), **Self transfer** between own linked accounts.
- **Check balance:** PIN entry, then animated balance reveal.
- Rules enforced server-side or in transactions: sufficient balance, daily limit, per-transaction limit, blocked users can't pay, all values come from admin settings.
- Use **Firestore transactions** so sender debit and receiver credit happen atomically.

### 4. Bills & recharges (simulated)
- Mobile recharge: operator detection, plans list (from admin), pay.
- Electricity, DTH, FASTag, broadband, water, gas, credit card: biller list → enter consumer number → fetched dummy bill → pay.

### 5. Rewards & offers
- Scratch cards with a real scratch animation after eligible payments (rules set in admin), cashback credited to balance.
- Rewards list, offers page, referral code screen.

### 6. Transaction history
- Full list grouped by month, with search and filters (sent/received/failed, date range, amount).
- Tap → transaction details screen.

### 7. Profile & settings
- Profile photo, name, phone, personal QR code (download/share).
- Bank accounts: add, remove, set primary, change/reset UPI PIN.
- UPI IDs management, payment methods.
- Settings: notifications, privacy, language, app lock, sign out.
- Help & feedback (submits a ticket the admin can see and reply to).

### 8. Notifications
- Push notification + in-app notification list for money received, requests, rewards and admin broadcasts.

## Admin panel — full control
Simple, clean dashboard with a sidebar. Every action writes to Firestore and reflects in the app in real time.

1. **Dashboard:** total users, total transactions, total volume today/this week, success vs failed, charts (daily volume), recent activity.
2. **Users:** list/search/filter; view profile, linked banks, balance, transaction history; **add, edit, delete, block/unblock** user; **set or adjust balance** (credit/debit with reason); reset UPI PIN; force logout.
3. **Transactions:** table with search/filter/export CSV; **add a transaction manually** (choose sender/receiver, amount, note, status, date/time), **edit, delete, reverse/refund**, change status (success/pending/failed). Balances update to match, and every admin change is recorded in an audit log.
4. **Banks:** add/edit/remove supported banks (name, logo, IFSC prefix).
5. **Bills & recharges:** manage operators, billers, recharge plans, dummy bill amounts.
6. **Rewards & offers:** create scratch-card campaigns (rules, min amount, cashback range), offers, referral bonus.
7. **Banners & home content:** upload/reorder/enable home carousel banners; show/hide home sections.
8. **App settings:** maintenance mode (app shows a maintenance screen), enable/disable any feature (QR, bills, rewards, etc.), per-transaction and daily limits, demo OTP mode on/off, minimum app version / force update message.
9. **Notifications:** send a push notification to all users or one user.
10. **Support tickets:** view and reply to user help requests.
11. **Audit logs:** every admin action with time and admin name.
12. **Admins:** add/remove admin accounts.

## Firestore data model (suggested)
`users`, `bankAccounts`, `transactions`, `requests`, `rewards`, `offers`, `banners`, `banks`, `billers`, `rechargePlans`, `notifications`, `tickets`, `settings/app` (single doc), `auditLogs`, `admins`. Write proper **security rules**: users can only read/write their own data; admin-only collections are writable by admins only.

## Seed data
Provide a seed script that creates: 1 admin, 10 demo users with photos and names, linked banks with starting balances, ~50 sample transactions between them, banks list, billers, plans, banners and offers, so the app looks populated on first launch.

## Quality bar
- Pixel-close to the reference video, smooth 60fps animations, proper loading/empty/error states, works offline gracefully (Firestore cache), no crashes.
- Responsive across phone sizes; admin panel works on laptop and tablet.
- Clean, commented code.

## Deliverables
1. Complete Flutter project source.
2. Complete admin panel source.
3. Firestore security rules + indexes + seed script.
4. A **README** with step-by-step setup for a beginner on Windows: installing Flutter and Android Studio, creating the Firebase project, adding `google-services.json`, running seed data, running on a phone via USB, building the release APK, running and deploying the admin panel.
5. A short project report section (architecture diagram, features list, screenshots list, future scope) that I can use in my college submission.

Build it step by step: first show the screen list from the video and the project structure, then implement module by module, making sure each part compiles before moving on.
