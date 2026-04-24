# Workshop Inventory

A local-only mobile app for Android and iOS that helps hobbyists track what's in their workshop — no account, no cloud, no hassle.

Organize your tools and materials into labeled **boxes** (e.g. "Green Plastic Box 1", "Dark Oak Chest") and add **items** to each box with a name, description, and optional photo.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (Managed Workflow) SDK 54 |
| Language | TypeScript |
| Storage | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — on-device SQLite |
| Navigation | [React Navigation](https://reactnavigation.org/) v7 (native stack) |
| Image picking | [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm 9+ or yarn 1.22+
- **To run on a physical device:** [Expo Go](https://expo.dev/go) app installed on your Android or iOS device
- **To run on an emulator/simulator:** Android Studio (Android) or Xcode (iOS, macOS only)

---

## Setup

```bash
git clone https://github.com/MrMovl/Workshop-inventory.git
cd Workshop-inventory
npm install
```

---

## Running the app

### Expo Go (quickest, physical device)

```bash
npx expo start
```

Scan the QR code printed in the terminal with:
- **Android:** the Expo Go app
- **iOS:** the default Camera app (iOS 16+) or the Expo Go app

### Android emulator

```bash
npx expo start --android
```

Requires Android Studio with a virtual device configured.

### iOS simulator (macOS only)

```bash
npx expo start --ios
```

Requires Xcode with a simulator installed.

---

## Local deployment (standalone builds)

To build a standalone APK or IPA that installs like a normal app (without Expo Go):

### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2. Configure EAS (first time only)

```bash
eas build:configure
```

This creates `eas.json` with build profiles (`development`, `preview`, `production`).

### 3. Build

```bash
# Android APK (installs directly on device)
eas build --platform android --profile preview

# iOS IPA (requires Apple Developer account)
eas build --platform ios --profile preview
```

Builds run on Expo's cloud infrastructure by default. To build locally:

```bash
# Requires Android Studio / Xcode installed
eas build --platform android --local
eas build --platform ios --local
```

### 4. Install on device

- **Android:** download the `.apk` from the EAS dashboard and open it on your device (enable "Install from unknown sources" if prompted)
- **iOS:** use TestFlight or install via Xcode Devices

---

## Project structure

```
├── App.tsx                   # Entry point — SQLiteProvider + NavigationContainer
├── app.json                  # Expo config (name, plugins, permissions)
├── src/
│   ├── db/
│   │   ├── schema.ts         # CREATE TABLE SQL strings
│   │   └── database.ts       # DB init + CRUD functions
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Stack navigator wiring all screens
│   ├── screens/
│   │   ├── BoxListScreen.tsx
│   │   ├── BoxDetailScreen.tsx
│   │   ├── AddEditBoxScreen.tsx
│   │   └── AddEditItemScreen.tsx
│   ├── components/           # Shared UI components
│   └── types/
│       └── index.ts          # Box and Item TypeScript interfaces
└── assets/                   # App icons and splash images
```

---

## Data model

All data is stored locally in a SQLite database on the device. Nothing is sent to any server.

**Box** — a physical container in your workshop
- `name` — label for the box (e.g. "Green Plastic Box 1")

**Item** — something stored in a box
- `name` — what it is (e.g. "Wood screws M4×20")
- `description` — any extra detail (e.g. "Approx. 200 left, bought 2024")
- `photoUri` — optional photo stored on-device
- `boxId` — which box this item belongs to

---

## Local-only

This app has no backend, no authentication, and no network sync. All data lives on the device. Uninstalling the app removes all data.

---

## License

MIT — see [LICENSE](LICENSE).
