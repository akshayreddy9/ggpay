# GGPay — UPI Payments App + Admin Panel

A Google Pay–style UPI payments app for Android (React Native / Expo) with a web admin panel that controls everything in the app in real time. College project: **no real money moves**. All balances and transactions live in the project's own database.

```
Gpay/
├── server/          Node.js + Express + Socket.io backend and admin panel
│   ├── src/         index.js (API), db.js (JSON database), seed.js (demo data)
│   └── public/admin Admin panel (HTML/CSS/JS, served at /admin)
├── mobile/          Expo (React Native) Android app
│   ├── app/         One file per screen (Expo Router)
│   ├── components/  Shared UI: buttons, keypad, PIN dots, scratch card, success tick
│   └── lib/         API client, global store + live updates, formatting, theme
├── START-SERVER.bat Double-click to start the server + open admin panel
└── START-APP.bat    Double-click to start the app (scan QR with Expo Go)
```

---

## 0. Online version (works on any phone, any network)

| What | Where |
|---|---|
| Admin panel | <https://ggpay.onrender.com/admin> (`admin` / `admin123`) |
| Server / API | `https://ggpay.onrender.com` (hosted on Render, data stored in MongoDB Atlas) |
| Android APK | Built with Expo EAS. Download it from the project's **Builds** page on expo.dev and install it on any Android phone |
| Source code | Private GitHub repo `akshayreddy9/ggpay` |

The APK always talks to the online server. On Render's free plan the server sleeps after about 15 minutes without use, so the **first request after a break takes up to a minute**. Open the admin panel a minute before a demo to wake it up.

To rebuild the APK after changes: `cd mobile`, then `npx eas-cli@latest build -p android --profile preview`.

## 1. Run it locally (about 5 minutes)

**You need:** a Windows laptop with [Node.js](https://nodejs.org) (LTS) installed, and an Android phone on the **same Wi-Fi** as the laptop.

1. **Start the server:** double-click `START-SERVER.bat`.
   The admin panel opens at <http://localhost:4000/admin>. Log in with `admin` / `admin123`.
   The window prints a line like `Phone/LAN: http://192.168.1.8:4000`. That is the address the phone uses.
   > If Windows Firewall asks, click **Allow access** (Private networks). Without this the phone can't reach the server.

2. **Start the app:** double-click `START-APP.bat`. The first run installs packages, which takes a few minutes.

3. **On your phone:** install **Expo Go** from the Play Store, open it, and scan the QR code shown in the `START-APP` window.

4. **Log in to the app** with a demo number:

   | Mobile number | Name | UPI PIN |
   |---|---|---|
   | 9876543210 | Rahul Sharma (2 bank accounts) | 1234 |
   | 9876543211 – 9876543219 | Priya, Arjun, Sneha, Vikram… | 1234 |
   | Any other 10-digit number | New user: full sign-up flow | You set it |

   The OTP is **123456** (demo mode). It also pops up like an SMS and auto-fills.

> **App says "Can't reach the server"?** Tap ⚙️ on the welcome screen (or *Settings → Server address*), enter the `Phone/LAN` address from the server window, then tap **Test** and **Save**.

### Manual commands (same as the .bat files)
```bash
cd server && npm install && npm start      # server on :4000
cd mobile && npm install && npx expo start # app; scan QR with Expo Go
```

---

## 2. App features

| Area | What it does |
|---|---|
| **Onboarding** | Splash animation → language selection → mobile number → OTP (auto-read) → profile with photo → choose bank → "SMS verification" → account found → debit card details → set 4/6-digit UPI PIN |
| **Home** | Search bar, promotional banner carousel, 8 quick actions, UPI ID chip (tap to copy), pending money requests, People, Businesses, Bills & recharges, Offers & rewards, Manage your money, floating **Scan any QR** button |
| **Pay** | Pay contacts / phone number / UPI ID (verified banking name shown), big amount entry, note, choose bank account sheet, **UPI PIN pad**, processing screen, animated success tick + sound + haptics, failure screen with reason |
| **Chat-style history** | Per-person thread with payment bubbles, requests (Pay / Decline / Cancel), Pay and Request buttons |
| **QR** | Camera QR scanner with torch, scan a QR from a gallery image, **My QR** (UPI format, works with other UPI apps), share |
| **Transfers** | Bank transfer (account no. + IFSC + name), self transfer between own accounts |
| **Bills & recharge** | Electricity, DTH, broadband, water, gas, FASTag, credit card, insurance: fetch bill → pay. Mobile recharge with operator detection and plan tabs |
| **Rewards** | Scratch cards (scratch with your finger) after eligible payments, cashback credited to the bank account, offers with coupon codes, referral code |
| **History** | Grouped by month with "spent" totals, filters (sent / received / failed / bills / last 30 days), search, full transaction details with copyable UPI reference, share receipt |
| **Account** | Check balance (with PIN), manage bank accounts (primary, change PIN, forgot PIN, remove, add), edit profile, notifications, help & support chat, app lock (fingerprint), sign out |
| **Live** | Money received pops up as a notification instantly; admin changes appear without refreshing |

## 3. Admin panel features (`/admin`)

| Page | Control |
|---|---|
| Dashboard | Users, transactions, today's volume, money in accounts, 14-day volume chart, quick switches (maintenance, demo OTP, rewards) |
| Users | Search/filter, **add / edit / delete / block / unblock**, force logout, open a user to **adjust balance** (credit / debit / set exact), reset UPI PIN, add/remove bank accounts, change primary, send notification, give scratch card |
| Transactions | Filter by text, status, type and dates. **Add any transaction** (choose sender/receiver or external name, amount, status, date/time, note, UPI ref), **edit**, **refund**, **delete** (optionally restoring balances), export CSV |
| Money requests | View and delete requests |
| Banks / Billers / Recharge plans / Offers / Home banners | Add, edit, enable/disable, delete. Changes appear in the app immediately |
| Rewards | Cashback campaigns (minimum amount, win chance, cashback range) and all issued scratch cards |
| Notifications | Send to all users or one user (pops up live in the app) |
| Support tickets | Read and reply to user requests, open/close |
| App settings | App name, home announcement, per-transaction and daily limits, new-account balance, referral bonus, OTP code, **maintenance mode**, **switch any feature on/off**, show/hide home sections, reset demo data |
| Audit logs | Every admin action with time and admin name |
| Admins | Add/remove admins, change password |

## 4. How it works

```
 Android phone (Expo app)  ──HTTP /api──▶  Node.js server  ◀──HTTP /api/admin──  Admin panel (browser)
          ▲                                  │   data/db.json
          └──────── Socket.io (live) ────────┘──────── Socket.io (live) ────────▶
```

- Every payment checks the UPI PIN (stored as a salted **scrypt** hash), the balance, the per-payment and daily limits, and feature switches. Failed payments are recorded with a reason, just like a real UPI app.
- When anything changes, the server pushes a `refresh` event to the affected phones and to the admin panel, which reload their data.
- Data is a JSON file (`server/data/db.json`), created with demo data on the first run. Delete the file, or use *Settings → Reset demo data*, to start fresh.

## 5. Build an installable APK (optional)

The Expo Go method above is enough for a demo. To get a real `.apk` file:

```bash
cd mobile
npx eas-cli@latest login            # free Expo account
npx eas-cli@latest build -p android --profile preview
```
The build runs in the cloud and gives you a download link for the APK. After installing it, open ⚙️ on the welcome screen and enter your server address (`http://<laptop-ip>:4000`).
To use the app away from your Wi-Fi, deploy the `server` folder to any Node host (Render, Railway…) and enter that URL instead.

## 6. Demo script for the viva

1. Open the admin panel on the laptop and the app on the phone, side by side.
2. In the app, pay Priya ₹250 → enter PIN 1234 → success animation and sound.
3. Show the transaction on the admin **Dashboard** straight away, then open **Transactions** → **Edit** it to ₹300 and watch the app update.
4. Admin → **Users → Rahul → Adjust balance** (+₹1,000) → app → *Check balance*.
5. Admin → **Settings → Maintenance mode ON** → the app shows the maintenance screen instantly → turn it off.
6. Admin → **Notifications** → send "Hello class!" → it pops up on the phone.
7. Pay a bill above ₹200 → win a scratch card → scratch it.
8. Admin → **Users → Block** → the app is locked out live.
