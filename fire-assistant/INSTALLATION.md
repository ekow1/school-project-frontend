# Fire Assistant — Installation & Setup Guide

**Application Name:** Fire Assistant  
**Version:** 1.0.0  
**Platform:** Android · iOS · Web  
**Framework:** React Native (Expo SDK 53)  

---

## Overview
Fire Assistant is a mobile application that connects citizens in Ghana with fire emergency services. It enables real-time fire station discovery, emergency incident reporting, AI-powered fire safety guidance, and officer workflow management.

This guide walks through everything needed to install, configure, and run the application on a local development machine.

---

## Table of Contents
1. [System Requirements](#1-system-requirements)
2. [Required Software Installation](#2-required-software-installation)
3. [Getting the Source Code](#3-getting-the-source-code)
4. [Installing Dependencies](#4-installing-dependencies)
5. [Running the Application](#5-running-the-application)
6. [Testing on a Physical Device](#6-testing-on-a-physical-device)
7. [Testing on an Emulator / Simulator](#7-testing-on-an-emulator--simulator)
8. [Default Test Accounts](#8-default-test-accounts)
9. [Application Features Walkthrough](#9-application-features-walkthrough)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. System Requirements

### Minimum Hardware
| Component | Requirement |
| :--- | :--- |
| **RAM** | 8 GB or more |
| **Storage** | 5 GB free disk space |
| **Internet** | Required (for API calls and Expo) |

### Operating System Support
| OS | Support |
| :--- | :--- |
| **Windows 10 / 11** | Full support (Android + Web) |
| **macOS 12 or later** | Full support (Android + iOS + Web) |
| **Ubuntu 20.04+** | Full support (Android + Web) |

> [!NOTE]
> iOS Simulator is only available on macOS. Windows and Linux users can test on Android physical devices or use an iPhone with Expo Go.

---

## 2. Required Software Installation

### Step 1 — Install Node.js
Node.js is required to run the development server and install packages.
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (18 or higher)
3. Run the installer and follow the on-screen instructions
4. Verify installation by opening a terminal and running:
   ```bash
   node --version
   # Expected output: v18.x.x or higher

   npm --version
   # Expected output: 9.x.x or higher
   ```

### Step 2 — Install Expo CLI
Expo CLI is the command-line tool used to start the development server.
```bash
npm install -g @expo/cli
```
Verify it installed correctly:
```bash
npx expo --version
# Expected output: 0.x.x
```

### Step 3 — Install Expo Go on Your Mobile Device (Recommended)
Expo Go is a free app that lets you run the application directly on your phone without connecting a cable.

| Platform | Download |
| :--- | :--- |
| **Android** | Google Play Store — search "Expo Go" |
| **iPhone** | Apple App Store — search "Expo Go" |

> [!IMPORTANT]
> Your phone and computer must be connected to the same Wi-Fi network.

### Step 4 — (Optional) Android Emulator
If you prefer testing on a computer without a physical device:
1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio → **More Actions** → **Virtual Device Manager**
3. Click **Create Device** → select **Pixel 7** → select **API 34** → **Finish**
4. Click the **Play** button to start the emulator

---

## 3. Getting the Source Code

### Option A — From a ZIP Archive
Extract the ZIP file to a folder on your computer, for example:
* **Windows**: `C:\Projects\fire-assistant`
* **macOS/Linux**: `~/Projects/fire-assistant`

Open a terminal and navigate into the extracted folder:
```bash
cd path/to/fire-assistant
```

### Option B — From Git
```bash
git clone <repository-url>
cd fire-assistant
```

---

## 4. Installing Dependencies
Inside the `fire-assistant` folder, run:
```bash
npm install
```
This downloads all required packages into the `node_modules/` folder. It may take 2–5 minutes depending on your internet connection.

> [!TIP]
> If you see warnings during installation, they can be safely ignored. Only errors (red text) require attention.

---

## 5. Running the Application

### Start the Development Server
From inside the `fire-assistant` folder, run:
```bash
npm start
```
or equivalently:
```bash
npx expo start
```

You will see a screen similar to this in your terminal:
```
Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```
The server must remain running while you use the app. Do not close the terminal.

---

## 6. Testing on a Physical Device
This is the recommended and easiest method.

1. Make sure your phone and computer are on the same Wi-Fi network.
2. Start the development server with `npm start`.
3. Open the **Expo Go** app on your phone.
4. Scan the QR code displayed in the terminal:
   * **Android**: Use the built-in scanner in Expo Go
   * **iPhone**: Use the default Camera app, then tap the notification banner
5. The app will load on your device within 30–60 seconds on the first load.

---

## 7. Testing on an Emulator / Simulator

### Android Emulator
1. Start an Android Virtual Device from Android Studio (see Step 4 in section 2).
2. With the emulator running, press `a` in the Expo terminal.
3. The app will install and launch automatically.

### iOS Simulator (macOS only)
1. Ensure Xcode is installed (download from the Mac App Store).
2. With the development server running, press `i` in the Expo terminal.
3. The iOS Simulator will open and the app will load automatically.

### Web Browser
1. Press `w` in the Expo terminal to open the app in your default web browser.

> [!WARNING]
> Some features such as GPS location and native maps may behave differently in a web browser. Physical device testing is recommended for the full experience.

---

## 8. Default Test Accounts
The application is connected to a live backend. You can create a new account or use the test credentials below.

### 🧑‍🚒 Fire Officer Account (Demo Profile)
Use this account to test officer-specific features such as assignments, turnout slips, and station actions.
* **Service Number / ID**: `GNFS-1113`
* **Password**: `latif@123`
* **Demo Station Action**: Please select or use the **University of Ghana Fire Station** for demonstration flows.

### 🧑 Regular Citizen Account
* **Phone Number**: `0241234567`
* **Password**: `Test@1234`

### 🌐 Central Admin Portal
The central command and dispatcher dashboard can be accessed online to monitor reports, live dispatch alerts, and fire station statistics:
* **Primary URL**: [gnfs.ekowlabs.space/station-admin/login](https://gnfs.ekowlabs.space/station-admin/login)
* **Alternative URL**: [gnfs.ekowlabs.tech/station-admin/login](https://gnfs.ekowlabs.tech/station-admin/login)

---

## 9. Application Features Walkthrough

### Registration & Login
1. On the first launch, swipe through the 3 onboarding slides and tap **Get Started**.
2. Tap **Register** to create a new account, or **Sign In** if you already have one.
3. To test officer features, tap **Officer Login** and use the officer credentials (`GNFS-1113` / `latif@123`).

### Home Dashboard
After logging in, you will land on the Home screen. It shows:
* Your current location at the top (with spacing for high visibility)
* Quick-action buttons (Report Incident, Find Station)
* Current weather with fire-safety advice
* A list of nearby fire stations
* A daily fire safety tip

### Fire Station Discovery
1. Tap **Find Station** on the Home screen or navigate to the **Stations** tab.
2. The app uses your GPS to find the nearest fire stations.
3. Tap the phone icon on any station card to call it directly.
4. Tap the directions icon to open Google Maps with a route to that station.

### Reporting an Incident
1. Tap the red `+` floating button on the Home screen or the **Incidents** tab.
2. Select the incident type (Fire, Flood, Gas Leak, etc.).
3. Set the priority level.
4. Confirm or change your location.
5. Select the nearest station to notify.
6. Add a description and tap **Submit Report**.
7. View your submitted reports in the **Incidents** tab.

### AI Chat Assistant
1. Navigate to the **AI Chat** tab (chat bubble icon).
2. Tap **New Chat** to start a conversation.
3. Ask any fire safety question, for example:
   * *"What should I do if there is a kitchen fire?"*
   * *"How do I use a fire extinguisher?"*
4. The AI responds with beautifully formatted, practical guidance in Neo-Brutalist boxes.
5. Previous conversations are saved as elevated retro-styled cards in the chat history list.

### Notifications
Navigate to the **Notifications** tab (bell icon) to view alerts and updates. Unread notifications show a badge count on the tab icon.

### Profile
1. Navigate to the **Profile** tab (person icon).
2. Tap **Edit Profile** to update your name, email, address, or profile photo.
3. Tap **Logout** at the bottom to sign out.

### Officer-Specific Features (Officer Login Required)
After logging in with officer credentials:
* **Turnout Slips tab** — View active incident assignments, call reporters, and get directions to incident locations.
* **Stations tab** — Full access to fire station discovery and data export.
* **Officer Profile tab** — View and update rank, station, and unit details.

---

## 10. Troubleshooting

### "Something went wrong" on startup
Clear the Metro bundler cache and restart:
```bash
npx expo start --clear
```

### App not loading on phone after scanning QR code
1. Confirm your phone and computer are on the same Wi-Fi network.
2. Try switching Expo to tunnel mode:
   ```bash
   npx expo start --tunnel
   ```
   Then scan the new QR code. This routes traffic through Expo's servers and works on any network.

### "npm install" fails
Try clearing the npm cache and reinstalling:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```
On Windows (PowerShell):
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### Location / GPS not working
When prompted, tap **Allow** for location permission.
* **On Android**: *Settings → Apps → Fire Assistant → Permissions → Location → Allow all the time*.
* **On iOS**: *Settings → Privacy → Location Services → Fire Assistant → While Using*.

### Blank white screen after login
This is usually a network connectivity issue. Ensure you have an active internet connection — the app communicates with a live backend API.

### Port already in use
If port 8081 is occupied, Expo will prompt you to use a different port. Press `y` to accept.

---

## Summary of Commands

| Command | What it does |
| :--- | :--- |
| `npm install` | Install all dependencies |
| `npm start` | Start the development server |
| `npx expo start --clear` | Start with cleared cache |
| `npx expo start --tunnel` | Start with tunnel (for restricted networks) |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS Simulator (macOS only) |
| `npm run web` | Open in web browser |

---

**Built with ❤️ for fire safety in Ghana**
