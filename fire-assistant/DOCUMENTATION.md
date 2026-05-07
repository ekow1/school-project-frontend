# Fire Assistant — Comprehensive System Documentation

**Version:** 1.0.0  
**Platform:** iOS · Android · Web  
**Framework:** React Native (Expo SDK 54)  
**Target Region:** Ghana

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [System Architecture](#2-system-architecture)
3. [Prerequisites & Environment Setup](#3-prerequisites--environment-setup)
4. [Installation & Configuration](#4-installation--configuration)
5. [Environment Variables](#5-environment-variables)
6. [Project Structure](#6-project-structure)
7. [Authentication System](#7-authentication-system)
8. [Core Features & Modules](#8-core-features--modules)
   - 8.1 [Home Dashboard](#81-home-dashboard)
   - 8.2 [Fire Station Discovery](#82-fire-station-discovery)
   - 8.3 [AI Chat Assistant](#83-ai-chat-assistant)
   - 8.4 [Incident Reporting](#84-incident-reporting)
   - 8.5 [Turnout Slips (Officers)](#85-turnout-slips-fire-officers)
   - 8.6 [Notifications](#86-notifications)
   - 8.7 [User Profile](#87-user-profile)
   - 8.8 [Weather & Safety Tips](#88-weather--safety-tips)
9. [State Management](#9-state-management)
10. [API Reference](#10-api-reference)
11. [Component Library](#11-component-library)
12. [Utility Functions](#12-utility-functions)
13. [Navigation & Routing](#13-navigation--routing)
14. [Design System](#14-design-system)
15. [Data Persistence](#15-data-persistence)
16. [Build & Deployment](#16-build--deployment)
17. [User Manual](#17-user-manual)
18. [Officer User Manual](#18-fire-officer-user-manual)
19. [Troubleshooting](#19-troubleshooting)
20. [Dependency Reference](#20-dependency-reference)

---

## 1. System Overview

Fire Assistant is a mobile-first emergency services application designed for Ghana. It connects citizens and Ghana National Fire Service (GNFS) officers through a unified platform that provides:

- Real-time fire station discovery using GPS and the Google Places API
- Emergency incident reporting with location tagging
- AI-powered fire safety guidance
- Officer workflow management (turnout slips)
- Push notification delivery for incidents and alerts
- Weather-aware safety recommendations

The system consists of three independent services:

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Mobile App** (this repo) | React Native / Expo | End-user and officer interface |
| **Auth API** | Node.js / Express | User registration, login, profile |
| **AI / Chat API** | Node.js / Express | AI conversations, incident storage |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Application                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │Auth Store│  │Chat Store│  │Reports   │  │Notif.  │  │
│  │(Zustand) │  │(Zustand) │  │Store     │  │Store   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │              │             │       │
│  ┌────▼──────────────▼──────────────▼─────────────▼────┐ │
│  │                   Axios HTTP Client                  │ │
│  └──────────────┬───────────────────┬──────────────────┘ │
└─────────────────│───────────────────│────────────────────┘
                  │                   │
       ┌──────────▼──────┐   ┌────────▼──────────┐
       │  Auth API        │   │  AI / Chat API     │
       │  auth.ekowlabs   │   │  ai.ekowlabs.space │
       │  .space/api      │   │  /api              │
       └─────────────────┘   └────────────────────┘

External Services:
  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐
  │ Google Places   │  │   Open-Meteo     │  │ Cloudinary │
  │ (Fire Stations) │  │ (Weather Data)   │  │ (Images)   │
  └─────────────────┘  └──────────────────┘  └────────────┘
```

### Data Flow

1. On app launch, `authStore.initializeAuth()` reads the cached token from AsyncStorage.
2. If a valid token exists, the user is routed directly to the tab navigator.
3. All API calls attach the token via an Axios request interceptor.
4. Location is managed globally through `LocationContext` and made available to all screens.
5. Stores communicate with the backend and cache results locally for offline resilience.

---

## 3. Prerequisites & Environment Setup

### Required Software

| Tool | Version | Installation |
|------|---------|-------------|
| Node.js | 18 or higher | https://nodejs.org |
| npm | 9 or higher | Bundled with Node.js |
| Expo CLI | Latest | `npm install -g @expo/cli` |
| Git | Any | https://git-scm.com |
| Android Studio | Latest | For Android emulator |
| Xcode | 15+ (macOS only) | Mac App Store |

### Mobile Testing Options

| Method | Platform | Notes |
|--------|---------|-------|
| Expo Go app | iOS / Android | Fastest; scan QR code |
| Android Emulator | Android | Requires Android Studio |
| iOS Simulator | iOS | macOS + Xcode required |
| Physical device | Both | Best fidelity |

### API Keys Required

| Service | Purpose | Where to Get |
|---------|---------|-------------|
| Google Maps / Places | Station discovery, routing | console.cloud.google.com |
| Mapbox | Fallback map tiles | mapbox.com |
| Cloudinary | Profile image uploads | cloudinary.com |
| Open-Meteo | Weather data | Free — no key needed |

---

## 4. Installation & Configuration

### Step 1 — Clone the Repository

```bash
git clone <repository-url>
cd fire-assistant
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Configure Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_AUTH_API_URL=https://auth.ekowlabs.space/api
EXPO_PUBLIC_CHAT_API_URL=https://ai.ekowlabs.space/api
EXPO_PUBLIC_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=YOUR_MAPBOX_TOKEN
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=YOUR_UPLOAD_PRESET
EXPO_PUBLIC_SERPER_API_KEY=YOUR_SERPER_KEY
```

> All keys prefixed with `EXPO_PUBLIC_` are safely embedded in the app bundle. Do not store server-side secrets with this prefix.

### Step 4 — Start Development Server

```bash
npm start
# or
npx expo start
```

Then press:
- `a` — open on Android emulator
- `i` — open on iOS simulator
- `w` — open in browser
- Scan the QR code with Expo Go on a physical device

---

## 5. Environment Variables

All environment variables are read through `config/env.ts`:

```typescript
// config/env.ts
export const ENV = {
  AUTH_API_URL:               // Base URL for authentication service
  CHAT_API_URL:               // Base URL for AI/chat service
  GOOGLE_API_KEY:             // Google Maps & Places API key
  MAPBOX_ACCESS_TOKEN:        // Mapbox access token
  CLOUDINARY_CLOUD_NAME:      // Cloudinary cloud name
  CLOUDINARY_UPLOAD_PRESET:   // Cloudinary unsigned upload preset
  SERPER_API_KEY:             // Serper.dev search API key
}
```

The file reads `process.env.EXPO_PUBLIC_*` values at build time and falls back to hardcoded development defaults if not set. Always override in production via EAS Secrets.

---

## 6. Project Structure

```
fire-assistant/
│
├── app/                          # All screens — Expo Router file-based routing
│   ├── _layout.tsx               # Root layout: splash, auth guard, font loading
│   ├── +not-found.tsx            # 404 fallback screen
│   ├── onboarding.tsx            # Welcome slides (shown once)
│   ├── login.tsx                 # Regular user login
│   ├── officer-login.tsx         # Fire officer login
│   ├── register.tsx              # New user registration
│   ├── verify.tsx                # OTP phone verification
│   ├── forgot-password.tsx       # Request password reset
│   ├── reset-password.tsx        # Enter new password
│   └── (tabs)/                   # Protected tab group
│       ├── _layout.tsx           # Tab bar configuration
│       ├── index.tsx             # Home / Dashboard
│       ├── ai-chat.tsx           # AI chat assistant
│       ├── fire-stations.tsx     # Station discovery
│       ├── incidents.tsx         # Incident reports
│       ├── notification.tsx      # Notifications
│       ├── turnout-slip.tsx      # Officer turnout slips
│       ├── officer-profile.tsx   # Officer profile
│       ├── profile.tsx           # Regular user profile
│       └── news-feed.tsx         # News feed
│
├── components/                   # Reusable UI components
│   ├── HomeGeneralTab.tsx        # Main dashboard content
│   ├── DailyTipCard.tsx          # Rotating fire safety tips
│   ├── WeatherCard.tsx           # Weather + safety recommendations
│   ├── FireStationsCard.tsx      # Station list widget
│   ├── FireStationDetailCard.tsx # Station details popup
│   ├── IncidentReportModal.tsx   # Emergency report form modal
│   ├── LocationSearch.tsx        # Location autocomplete picker
│   ├── ToastNotification.tsx     # Ephemeral status toasts
│   ├── CustomAlert.tsx           # Reusable alert/confirm dialog
│   ├── AnimatedScreen.tsx        # Screen entrance animation wrapper
│   ├── auth/
│   │   ├── AuthCard.tsx          # Auth form container card
│   │   ├── AuthLayout.tsx        # Auth screen layout wrapper
│   │   └── PasswordStrength.tsx  # Password strength indicator bar
│   ├── chat/
│   │   ├── ChatInput.tsx         # Chat message input bar
│   │   ├── MarkdownRenderer.tsx  # Renders markdown in chat bubbles
│   │   └── TypewriterMarkdown.tsx # Animated AI response rendering
│   ├── form/
│   │   ├── FormInput.tsx         # Generic labeled text input
│   │   ├── FormButton.tsx        # Primary action button
│   │   └── PasswordInput.tsx     # Password field with show/hide
│   └── profile/
│       ├── ProfileHeader.tsx     # Avatar + name header block
│       └── ProfileSection.tsx    # Grouped settings section
│
├── store/                        # Zustand global state
│   ├── authStore.ts              # Auth, user profile, token
│   ├── chatStore.ts              # Chat sessions and messages
│   ├── fireReportsStore.ts       # Incident reports
│   ├── notificationStore.ts      # In-app notifications
│   └── fireStationStore.ts       # Cached station list
│
├── context/
│   ├── LocationContext.tsx       # GPS location state provider
│   └── AlertContext.tsx          # Global alert dialog provider
│
├── utils/
│   ├── fireStationService.js     # Google Places station search
│   ├── fireStationSearch.ts      # Geospatial search logic
│   ├── validation.ts             # Input validators
│   └── cloudinary.ts             # Image upload helper
│
├── config/
│   └── env.ts                    # Environment variable access
│
├── constants/
│   ├── Colors.ts                 # Color palette
│   └── theme.ts                  # Shared theme tokens
│
└── assets/
    ├── images/                   # App icon, splash, illustrations
    └── fonts/                    # SpaceMono font files
```

---

## 7. Authentication System

### Overview

Authentication is handled entirely by the Auth API. The mobile app stores the returned JWT token in AsyncStorage and attaches it to every subsequent request.

### User Types

| Type | Login Screen | Special Access |
|------|------------|---------------|
| `regular` | `/login` | Standard features |
| `fire_officer` | `/officer-login` | Turnout slips, stations tab, officer profile |

### Auth Flow Diagram

```
App Start
  └─ initializeAuth()
        ├─ Token in AsyncStorage?
        │     ├─ YES → getProfile() → navigate to /(tabs)
        │     └─ NO  → hasSeenOnboarding?
        │                   ├─ NO  → /onboarding
        │                   └─ YES → /login
        │
Login/Register → API → JWT Token
  └─ Store token → navigate to /(tabs)
```

### Token Management

```typescript
// Reading token
const token = await AsyncStorage.getItem('@auth_token');

// Attaching to requests (authStore)
const headers = { Authorization: `Bearer ${token}` };

// Clearing on logout
await AsyncStorage.removeItem('@auth_token');
await AsyncStorage.removeItem('@auth_user');
```

### Registration Fields

| Field | Required | Validation |
|-------|---------|-----------|
| Full Name | Yes | Min 2 chars, letters only |
| Phone | Yes | Ghana format (+233XXXXXXXXX) |
| Email | No | Standard email format |
| Password | Yes | Min 8 chars, mixed case + number |
| Confirm Password | Yes | Must match password |
| Country | Yes | Country picker |

### Officer Login Fields

| Field | Required | Notes |
|-------|---------|-------|
| Service Number | Yes | Unique GNFS service number |
| Password | Yes | Assigned by admin |

---

## 8. Core Features & Modules

### 8.1 Home Dashboard

**File:** [app/(tabs)/index.tsx](app/(tabs)/index.tsx)  
**Component:** [components/HomeGeneralTab.tsx](components/HomeGeneralTab.tsx)

The dashboard aggregates all primary information into a single scrollable view.

**Sections (top to bottom):**
1. **Header** — location name with search icon
2. **Quick Actions** — "Report Incident" and "Find Station" buttons
3. **Weather Card** — current conditions from Open-Meteo
4. **Nearby Stations** — top 3 closest fire stations
5. **Daily Safety Tip** — rotating fire prevention tip
6. **Floating Action Button** — shortcut to incident reporting modal

**Pull-to-refresh** reloads weather, station list, and tip simultaneously.

---

### 8.2 Fire Station Discovery

**File:** [app/(tabs)/fire-stations.tsx](app/(tabs)/fire-stations.tsx)  
**Service:** [utils/fireStationService.js](utils/fireStationService.js)  
**Search Logic:** [utils/fireStationSearch.ts](utils/fireStationSearch.ts)

#### How Station Discovery Works

1. The app requests the user's current GPS coordinates via `LocationContext`.
2. `fetchNearbyFireStations()` sends a Places API `nearbysearch` request for "fire station" within 20 km.
3. Results are ranked by proximity score (a weighted combination of straight-line distance and route distance).
4. If no results are found nearby, service area fallbacks for Ghana regions are used.
5. Clicking a station opens a detail card with phone, address, and a Google Maps directions link.

#### Station Data Model

```typescript
interface FireStation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone?: string           // Fetched via Place Details API
  distance?: number        // Straight-line km
  routeDistance?: number   // Driving km
  travelTime?: number      // Minutes
  rating?: number
  proximityScore?: number  // 0–100 ranking score
  placeId?: string         // Google Place ID
  isServiceAreaStation?: boolean
}
```

#### Ghana Service Area Fallbacks

The app includes predefined boundaries for:
- Greater Accra (East Legon, Dome-Kwabenya, Botwe, Tema, Achimota)
- Central Region (Kasoa)
- Extensible to all 16 Ghana regions

---

### 8.3 AI Chat Assistant

**File:** [app/(tabs)/ai-chat.tsx](app/(tabs)/ai-chat.tsx)  
**Store:** [store/chatStore.ts](store/chatStore.ts)

#### Features

- Multi-session chat history (persisted per account)
- Typewriter animation on AI responses
- Markdown rendering (bold, lists, code blocks)
- Message actions: copy, like/dislike, edit, delete
- Quick-prompt chips for common questions

#### Session Lifecycle

```
User taps "New Chat"
  └─ createSession() → POST /api/chat
        └─ Returns session ID

User sends message
  └─ addMessage() → POST /api/chat/:id/message
        └─ Streams/returns AI response
              └─ Typewriter renders the response

User taps session in history
  └─ openSession() → loads messages from store
```

#### Message Types

```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isNew?: boolean      // triggers typewriter on first render
  feedback?: 'like' | 'dislike'
}
```

---

### 8.4 Incident Reporting

**File:** [app/(tabs)/incidents.tsx](app/(tabs)/incidents.tsx)  
**Component:** [components/IncidentReportModal.tsx](components/IncidentReportModal.tsx)  
**Store:** [store/fireReportsStore.ts](store/fireReportsStore.ts)

#### Incident Types

| Type | Icon | Description |
|------|------|-------------|
| `fire` | Flame | Building or bush fire |
| `flood` | Water | Flooding emergency |
| `gas-leak` | Alert | Gas leak hazard |
| `hazmat` | Bio | Hazardous materials |
| `rescue` | Person | Rescue operation needed |
| `other` | Ellipsis | Other emergencies |

#### Priority Levels

| Level | Color | Use Case |
|-------|-------|---------|
| `low` | Green | Non-urgent, no immediate danger |
| `medium` | Orange | Risk present, action needed |
| `high` | Red | Active emergency, lives at risk |

#### Report Lifecycle

```
Submitted → pending → in-progress → resolved
                              └──────→ cancelled
```

#### Incident Data Model

```typescript
interface FireReport {
  _id: string
  userId: string
  incidentType: string
  incidentName: string
  location: {
    coordinates: { latitude: number; longitude: number }
    locationUrl: string
    locationName: string
  }
  station: {
    name: string
    address: string
    phone?: string
    coordinates: { latitude: number; longitude: number }
  }
  reportedAt: string
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  description?: string
  assignedTo?: string
}
```

---

### 8.5 Turnout Slips (Fire Officers)

**File:** [app/(tabs)/turnout-slip.tsx](app/(tabs)/turnout-slip.tsx)

Turnout slips are incident assignments dispatched to fire officers. This screen is only visible to users with `userType === 'fire_officer'`.

#### Tabs

| Tab | Content |
|-----|---------|
| **Active** | Currently assigned, in-progress incidents |
| **Referred** | Incidents referred to another unit |
| **Closed** | Completed/resolved incidents |

#### Officer Actions Per Slip

- **Call Reporter** — opens phone dialer with reporter's number
- **Get Directions** — opens Google Maps to incident location

---

### 8.6 Notifications

**File:** [app/(tabs)/notification.tsx](app/(tabs)/notification.tsx)  
**Store:** [store/notificationStore.ts](store/notificationStore.ts)

#### Notification Types

| Type | Description |
|------|-------------|
| `incident` | New or updated incident report |
| `turnout_slip` | New assignment (officers) |
| `alert` | System-level safety alert |
| `info` | General informational message |
| `login` | Login activity notification |

#### Tabs

| Tab | Filter |
|-----|--------|
| **All** | Every notification |
| **Recent** | Unread notifications only |
| **History** | Previously read |

#### Persistence

Notifications are persisted to AsyncStorage under `@notifications`. The unread count badge on the tab bar reflects `notificationStore.unreadCount`.

---

### 8.7 User Profile

**Regular User:** [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx)  
**Fire Officer:** [app/(tabs)/officer-profile.tsx](app/(tabs)/officer-profile.tsx)

#### Editable Fields (Regular User)

| Field | Notes |
|-------|-------|
| Full Name | Required |
| Email | Optional |
| Date of Birth | Date picker |
| Country | Country picker modal |
| Address | Free text |
| Ghana Post GPS | Digital address code |
| Profile Photo | Uploaded to Cloudinary |

#### Officer Profile Fields

| Field | Editable |
|-------|---------|
| Service Number | Read-only |
| Full Name | Yes |
| Rank | Yes |
| Station | Yes |
| Department | Yes |
| Unit | Yes |
| Status | Yes |

#### Image Upload Flow

```
User selects photo (expo-image-picker)
  └─ uploadImageToCloudinary()
        └─ POST https://api.cloudinary.com/v1_1/{cloud}/image/upload
              └─ Returns secure_url
                    └─ updateProfile({ image: url })
```

---

### 8.8 Weather & Safety Tips

**Component:** [components/WeatherCard.tsx](components/WeatherCard.tsx)  
**Component:** [components/DailyTipCard.tsx](components/DailyTipCard.tsx)

Weather data is fetched from the Open-Meteo free API using the user's current coordinates. No API key is required.

Displayed data:
- Temperature (°C)
- Weather condition icon
- Brief condition description
- Context-aware fire safety tip (e.g., high wind → "Avoid open burning today")

Daily tips rotate by day-of-week and are stored as static data in the component — no network request required.

---

## 9. State Management

The app uses **Zustand** for all global state. Each store is independent and communicates with the backend through Axios.

### authStore.ts

**State:**

| Key | Type | Description |
|-----|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `token` | `string \| null` | JWT auth token |
| `isLoading` | `boolean` | Any async operation in progress |
| `error` | `string \| null` | Last error message |
| `isInitialized` | `boolean` | Auth check completed |
| `hasSeenOnboarding` | `boolean` | First-run flag |

**Actions:**

| Action | HTTP | Endpoint |
|--------|------|----------|
| `register()` | POST | `/api/auth/register` |
| `login()` | POST | `/api/auth/login` |
| `officerLogin()` | POST | `/api/auth/officer-login` |
| `verifyPhone()` | POST | `/api/auth/verify-phone` |
| `forgotPassword()` | POST | `/api/auth/forgot-password` |
| `resetPassword()` | POST | `/api/auth/reset-password` |
| `getProfile()` | GET | `/api/auth/profile` |
| `updateProfile()` | PUT | `/api/auth/profile` |
| `deleteProfile()` | DELETE | `/api/auth/profile` |
| `logout()` | — | Clears local storage |
| `initializeAuth()` | — | Reads token from storage |

---

### chatStore.ts

**State:**

| Key | Type | Description |
|-----|------|-------------|
| `sessions` | `ChatSession[]` | All conversations |
| `currentSession` | `ChatSession \| null` | Open session |
| `messages` | `ChatMessage[]` | Messages in current session |
| `isInSession` | `boolean` | Viewing a session |
| `isLoading` | `boolean` | Request in flight |
| `newMessageIds` | `string[]` | IDs for typewriter animation |

**Actions:**

| Action | Description |
|--------|-------------|
| `createSession()` | Start a new conversation |
| `fetchSessions()` | Load all sessions from API |
| `openSession()` | Set active session and load messages |
| `deleteSession()` | Remove a conversation |
| `addMessage()` | Send a message and receive AI reply |
| `deleteMessage()` | Remove a message |
| `editMessage()` | Update message content |
| `likeMessage()` | Send feedback (like/dislike) |
| `copyMessage()` | Copy text to clipboard |
| `startNewSession()` | Reset to new chat state |
| `goBack()` | Return to session list |

---

### fireReportsStore.ts

**State:**

| Key | Type | Description |
|-----|------|-------------|
| `reports` | `FireReport[]` | All incident reports |
| `isLoading` | `boolean` | Fetch/submit in progress |
| `error` | `string \| null` | Last error |

**Actions:**

| Action | HTTP | Endpoint |
|--------|------|----------|
| `createReport()` | POST | `/api/incidents` |
| `getAllFireReports()` | GET | `/api/incidents` |
| `updateReportStatus()` | PUT | `/api/incidents/:id` |
| `sendFireStationsBulk()` | POST | `/api/incidents/stations` |
| `sendFireStationClick()` | POST | `/api/incidents/station-click` |

---

### notificationStore.ts

**State:**

| Key | Type | Description |
|-----|------|-------------|
| `notifications` | `Notification[]` | All notifications |
| `unreadCount` | `number` | Badge count |
| `hasNewTurnoutSlip` | `boolean` | Indicator flag |
| `hasNewIncident` | `boolean` | Indicator flag |

**Actions:**

| Action | Description |
|--------|-------------|
| `initialize()` | Load from AsyncStorage |
| `addNotification()` | Push new notification |
| `markAsRead()` | Mark single as read |
| `markAllAsRead()` | Clear unread count |
| `removeNotification()` | Delete a notification |
| `clearAll()` | Remove all notifications |
| `setNewTurnoutSlip()` | Toggle new slip flag |
| `setNewIncident()` | Toggle new incident flag |

---

## 10. API Reference

### Authentication Service — `AUTH_API_URL`

| Method | Endpoint | Body | Response |
|--------|---------|------|---------|
| POST | `/api/auth/register` | `{name, phone, email, password}` | `{token, user}` |
| POST | `/api/auth/login` | `{phone, password}` | `{token, user}` |
| POST | `/api/auth/officer-login` | `{serviceNumber, password}` | `{token, user}` |
| POST | `/api/auth/verify-phone` | `{phone, code}` | `{verified: true}` |
| POST | `/api/auth/forgot-password` | `{phone}` | `{message}` |
| POST | `/api/auth/reset-password` | `{token, password}` | `{message}` |
| GET | `/api/auth/profile` | — (auth header) | `{user}` |
| PUT | `/api/auth/profile` | `Partial<User>` | `{user}` |
| DELETE | `/api/auth/profile` | — (auth header) | `{message}` |

### Chat / AI Service — `CHAT_API_URL`

| Method | Endpoint | Body | Response |
|--------|---------|------|---------|
| POST | `/api/chat` | `{title?}` | `{session}` |
| GET | `/api/chat` | — | `{sessions[]}` |
| DELETE | `/api/chat/:id` | — | `{message}` |
| POST | `/api/chat/:id/message` | `{content}` | `{message, reply}` |
| POST | `/api/chat/:id/message/:msgId/feedback` | `{type: 'like'\|'dislike'}` | `{message}` |

### Incident Service — `CHAT_API_URL`

| Method | Endpoint | Body | Response |
|--------|---------|------|---------|
| POST | `/api/incidents` | `FireReport` | `{report}` |
| GET | `/api/incidents` | — | `{reports[]}` |
| PUT | `/api/incidents/:id` | `{status, assignedTo?}` | `{report}` |
| POST | `/api/incidents/stations` | `{stations[]}` | `{message}` |
| POST | `/api/incidents/station-click` | `{stationId, userId}` | `{message}` |

### Request Headers

All authenticated requests must include:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 11. Component Library

### AnimatedScreen

Wraps any screen content with a fade-in + slide-up entrance animation.

```tsx
<AnimatedScreen>
  <YourContent />
</AnimatedScreen>
```

---

### CustomAlert

Global alert/confirmation dialog managed through `AlertContext`.

```tsx
// Trigger from anywhere
showAlert({
  type: 'confirm',       // 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title: 'Delete Account',
  message: 'This cannot be undone.',
  onConfirm: () => deleteProfile(),
  onCancel: () => {},
});
```

---

### ToastNotification

Temporary status banner shown at the top of the screen.

```tsx
<ToastNotification
  visible={showToast}
  message="Report submitted successfully"
  type="success"          // 'success' | 'error' | 'warning' | 'info'
  onHide={() => setShowToast(false)}
/>
```

---

### FormInput

Standardized text input with label and error state.

```tsx
<FormInput
  label="Phone Number"
  value={phone}
  onChangeText={setPhone}
  error={errors.phone}
  keyboardType="phone-pad"
  placeholder="+233 XX XXX XXXX"
/>
```

---

### PasswordInput

Password field with visibility toggle and strength indicator.

```tsx
<PasswordInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  showStrength={true}
/>
```

---

### TypewriterMarkdown

Renders AI response text with a character-by-character typewriter animation, then displays the final markdown once complete.

```tsx
<TypewriterMarkdown
  content={message.content}
  isNew={message.isNew}
  onComplete={() => markAnimationDone(message.id)}
/>
```

---

### LocationSearch

Full-screen location picker with search autocomplete and map view.

```tsx
<LocationSearch
  visible={showPicker}
  onLocationSelect={(location) => setIncidentLocation(location)}
  onClose={() => setShowPicker(false)}
/>
```

---

## 12. Utility Functions

### validation.ts

```typescript
// Validates Ghana phone number (+233XXXXXXXXX or 0XXXXXXXXX)
validatePhoneNumber(phone: string): { valid: boolean; message?: string }

// Checks password requirements
validatePassword(password: string): { valid: boolean; message?: string }

// Validates full name
validateName(name: string): { valid: boolean; message?: string }

// Converts any Ghana number format to international format
formatPhoneNumber(phone: string): string   // Returns "+233XXXXXXXXX"

// Returns 0–5 strength score
calculatePasswordStrength(password: string): number

// Returns human-readable label
getPasswordStrengthLabel(score: number): 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
```

---

### cloudinary.ts

```typescript
// Uploads a local image URI to Cloudinary and returns the secure URL
uploadImageToCloudinary(
  imageUri: string,
  cloudName: string,
  uploadPreset: string
): Promise<string>
```

---

### fireStationService.js — Key Functions

```javascript
// Main entry point — searches for stations near coordinates
fetchNearbyFireStations(latitude, longitude, radius = 20000)

// Fetches Place Details for phone number and hours
fetchStationDetails(placeId)

// Computes proximity score for ranking
computeProximityScore(station, userLocation)

// Maps a coordinate to a Ghana service area if outside city coverage
mapToServiceArea(latitude, longitude)
```

---

### fireStationSearch.ts — Key Functions

```typescript
// Returns sorted stations by proximity score
rankStations(stations: FireStation[], userLocation: Coordinates): FireStation[]

// Calculates straight-line distance using Turf.js
calculateDistance(from: Coordinates, to: Coordinates): number  // km

// Returns the Ghana region for given coordinates
getGhanaRegion(latitude: number, longitude: number): string | null
```

---

## 13. Navigation & Routing

The app uses **Expo Router** (file-system routing). The route hierarchy maps directly to the `app/` directory.

### Route Groups

| Group | Path Prefix | Auth Required | Description |
|-------|------------|--------------|-------------|
| Auth screens | `/login`, `/register`, etc. | No | Pre-login flows |
| Tab navigator | `/(tabs)/` | Yes | Main app |

### Tab Bar Visibility (by User Type)

| Tab | Regular User | Fire Officer |
|-----|------------|-------------|
| Home | Visible | Visible |
| AI Chat | Visible | Visible |
| Incidents | Visible | Visible |
| Notifications | Visible | Visible |
| Profile | Visible | Hidden |
| Officer Profile | Hidden | Visible |
| Fire Stations | Hidden | Visible |
| Turnout Slips | Hidden | Visible |

### Root Layout Auth Guard (`app/_layout.tsx`)

```typescript
// Pseudocode of the guard logic
useEffect(() => {
  if (!isInitialized) return;
  if (token) {
    router.replace('/(tabs)');
  } else if (!hasSeenOnboarding) {
    router.replace('/onboarding');
  } else {
    router.replace('/login');
  }
}, [isInitialized, token]);
```

---

## 14. Design System

### Color Tokens (`constants/Colors.ts`)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#D32F2F` | Brand red, buttons, accents |
| `primaryLight` | `#FF6659` | Hover, light variants |
| `primaryDark` | `#9A0007` | Pressed states, dark theme |
| `secondary` | `#1A1A1A` | Headlines, dark text |
| `tertiary` | `#6B7280` | Body text, labels |
| `background` | `#F8FAFC` | Screen backgrounds |
| `surface` | `#FFFFFF` | Cards, modals |
| `border` | `#E2E8F0` | Dividers, outlines |
| `success` | `#10B981` | Confirmed, resolved |
| `warning` | `#F59E0B` | Cautions, medium priority |
| `danger` | `#EF4444` | Errors, high priority |
| `accent` | `#8B5CF6` | AI chat, special elements |

### Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Display | System | 28px | 700 |
| Heading | System | 22px | 700 |
| Subheading | System | 18px | 600 |
| Body | System | 16px | 400 |
| Caption | System | 13px | 400 |
| Monospace | Space Mono | 14px | 400 |

### Spacing Scale

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64`

### Component Standards

- Minimum touch target: **48×48 dp**
- Border radius: `8` (inputs), `12` (cards), `24` (pills/badges)
- Shadow elevation: `2` (cards), `4` (modals), `8` (FAB)

---

## 15. Data Persistence

### AsyncStorage Keys

| Key | Content | TTL |
|-----|---------|-----|
| `@auth_token` | JWT authentication token | Until logout |
| `@auth_user` | Serialized user object | Until logout |
| `@has_seen_onboarding` | Boolean flag | Permanent |
| `@notifications` | JSON array of notifications | Manual clear |
| `@new_incident_id` | Last unread incident ID | Until viewed |
| `@new_turnout_slip_id` | Last unread slip ID | Until viewed |

### Secure Storage (expo-secure-store)

Sensitive values are stored in the platform keychain/keystore for enhanced security:
- iOS: Apple Keychain Services
- Android: Android Keystore

---

## 16. Build & Deployment

### Development Build

```bash
npm start                # Expo Go compatible
npx expo run:android     # Debug native build (Android)
npx expo run:ios         # Debug native build (iOS, macOS only)
```

### Production Build with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

### EAS Build Profiles (`eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### Setting EAS Secrets (Production API Keys)

```bash
eas secret:create --name EXPO_PUBLIC_GOOGLE_API_KEY --value "YOUR_KEY"
eas secret:create --name EXPO_PUBLIC_AUTH_API_URL --value "https://auth.example.com/api"
```

### Over-the-Air Updates (EAS Update)

```bash
eas update --branch production --message "Fix incident status badge"
```

---

## 17. User Manual

This section describes how a regular citizen uses the Fire Assistant app.

---

### Getting Started

#### First Launch
1. Open the Fire Assistant app.
2. Swipe through the three onboarding slides to learn about the app's features.
3. Tap **Get Started**.

#### Creating an Account
1. Tap **Register** on the login screen.
2. Enter your:
   - Full name
   - Ghana phone number (e.g., `0241234567`)
   - Email address (optional)
   - Password (minimum 8 characters)
3. Tap **Create Account**.
4. Enter the 6-digit OTP sent to your phone to verify your number.
5. You will be taken to the Home screen.

#### Logging In
1. Enter your registered phone number and password.
2. Tap **Sign In**.
3. If you forget your password, tap **Forgot Password** and follow the reset instructions sent to your phone.

---

### Home Screen

The home screen is your main dashboard.

- **Location Bar (top)** — Shows your current area. Tap to change your location manually.
- **Report Incident** — Shortcut to submit an emergency report.
- **Find Station** — Shows the nearest fire station on the map.
- **Weather Card** — Current weather conditions and fire-safety advice for the day.
- **Nearby Stations** — The three closest fire stations with distance and call button.
- **Safety Tip** — A rotating daily fire prevention tip.

---

### Finding a Fire Station

1. From the Home screen, tap **Find Station** or navigate to the **Stations** tab.
2. The app shows a list of fire stations near your current location.
3. Each station card shows:
   - Station name
   - Distance from your location
   - Estimated travel time
   - Phone number
4. Tap the **Phone icon** to call the station directly.
5. Tap the **Directions icon** to open Google Maps with turn-by-turn directions.
6. Tap **Load More** to see additional stations.

> If you are not in an area with nearby stations, the app will show stations for your broader region.

---

### Reporting an Incident

1. Tap the **red floating button (+)** on the Home screen or navigate to the **Incidents** tab.
2. Tap the **+** button to open the report form.
3. Fill in the details:
   - **Incident Type** — Select the type of emergency (Fire, Flood, Gas Leak, etc.)
   - **Priority** — Choose Low, Medium, or High
   - **Location** — The form auto-fills your current location; tap to change it
   - **Nearest Station** — Select the station to notify
   - **Description** — Describe the emergency in detail
4. Tap **Submit Report**.
5. You will receive a confirmation and can track the status of your report in the **Incidents** tab.

#### Tracking Your Reports

In the Incidents tab, each report shows:
- Incident type and name
- Submission date and time
- Current status badge:
  - **Pending** (gray) — Awaiting response
  - **In Progress** (blue) — Officers have been dispatched
  - **Resolved** (green) — Emergency handled
  - **Cancelled** (red) — Report cancelled

---

### Using the AI Chat Assistant

1. Navigate to the **AI Chat** tab (chat bubble icon).
2. Tap **New Chat** to start a conversation.
3. Type your question or select one of the quick-prompt chips.
4. The AI assistant provides fire-safety guidance, emergency procedures, and preventive advice.

**Example questions:**
- "What should I do if my kitchen catches fire?"
- "How do I use a fire extinguisher?"
- "What are the fire safety rules for schools in Ghana?"
- "Is it safe to use a generator indoors?"

Your conversation history is saved and accessible from the chat history list.

---

### Notifications

The **Notifications** tab (bell icon) shows alerts about:
- Status updates on your incident reports
- Safety alerts from Ghana Fire Service
- Informational messages

Unread notifications show a red badge count on the tab icon. Tap a notification to mark it as read.

---

### Managing Your Profile

1. Navigate to the **Profile** tab (person icon).
2. Tap **Edit Profile** to update your information.
3. Tap your profile photo to upload a new picture from your gallery or camera.
4. Available settings:
   - **Change Password** — Update your login password
   - **Notifications** — Configure alert preferences
   - **Privacy** — Manage data and account visibility
   - **Help & Support** — Access help resources
5. Tap **Logout** at the bottom to sign out.

---

## 18. Fire Officer User Manual

This section covers features available exclusively to Ghana National Fire Service officers.

---

### Logging In as an Officer

1. On the login screen, tap **Officer Login**.
2. Enter your:
   - Service Number (assigned by GNFS)
   - Password
3. Tap **Sign In**.

The tab bar will show officer-specific tabs: **Turnout Slips**, **Stations**, and **Officer Profile**.

---

### Viewing Turnout Slips

1. Navigate to the **Turnout** tab (clipboard icon).
2. Slips are organized into three tabs:
   - **Active** — Incidents currently assigned to you
   - **Referred** — Incidents referred to another unit
   - **Closed** — Completed incidents
3. Each slip shows:
   - Incident type and priority level
   - Reporter name and phone number
   - Incident location and description
   - Date and time reported

#### Responding to a Slip

- Tap the **Phone icon** to call the person who reported the incident.
- Tap the **Directions icon** to open Google Maps and navigate to the incident location.

---

### Fire Station Discovery (Officers)

Officers have access to the full **Stations** tab:
- View all nearby stations with full details
- Use for coordinating response resources
- Call any station directly
- Export station data to the backend for record-keeping

---

### Officer Profile

1. Navigate to the **Officer Profile** tab.
2. View and update:
   - Full name and service number (read-only)
   - Rank and current status
   - Assigned station and department
   - Unit assignment
3. Tap **Quick Actions** for shortcuts to Turnout Slips and Incidents.

---

## 19. Troubleshooting

### App Won't Start

| Symptom | Solution |
|---------|---------|
| White/blank screen | Run `npx expo start --clear` to clear Metro cache |
| Dependency errors | Delete `node_modules/` and run `npm install` |
| iOS build fails | Run `cd ios && pod install && cd ..` |
| Android build fails | Run `cd android && ./gradlew clean && cd ..` |

### Location Not Working

| Symptom | Solution |
|---------|---------|
| "Permission denied" | Go to device Settings → Apps → Fire Assistant → Permissions → Location → Allow |
| Inaccurate location | Ensure GPS is enabled; move to an open area |
| Location not updating | Kill and reopen the app |

### No Fire Stations Showing

1. Check your internet connection.
2. Verify your Google Places API key is valid and has the **Places API** enabled.
3. Ensure billing is enabled for the Google Cloud project.
4. Check that the API key is not restricted to disallowed IP/app bundles.

### API / Login Errors

| Error | Likely Cause | Solution |
|-------|-------------|---------|
| "Invalid credentials" | Wrong phone/password | Use Forgot Password |
| "Network error" | No internet or server down | Check connection; try again |
| "Token expired" | Session timed out | Log out and log back in |
| 401 Unauthorized | Expired or invalid token | Log out and log back in |

### Chat Not Responding

1. Verify `EXPO_PUBLIC_CHAT_API_URL` is correct.
2. Confirm the AI backend server is running.
3. Check your internet connection.

---

## 20. Dependency Reference

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.33 | Core Expo SDK |
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.5 | Mobile rendering |
| `expo-router` | ~6.0.23 | File-based navigation |
| `zustand` | ^5.0.6 | State management |
| `axios` | ^1.11.0 | HTTP client |
| `expo-location` | ~19.0.8 | GPS services |
| `expo-maps` | ~0.12.10 | Map rendering |
| `react-native-maps` | 1.20.1 | Map components |
| `expo-secure-store` | ~15.0.8 | Encrypted key-value store |
| `expo-image-picker` | ~17.0.10 | Photo library / camera access |
| `expo-linear-gradient` | ~15.0.8 | Gradient backgrounds |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Persistent local storage |
| `openmeteo` | ^1.2.3 | Weather data (free, no key) |
| `@turf/turf` | ^7.3.0 | Geospatial calculations |
| `marked` | ^16.4.1 | Markdown parsing |
| `react-native-markdown-display` | ^7.0.2 | Markdown rendering |
| `react-native-country-picker-modal` | ^2.0.0 | Country selection UI |
| `expo-haptics` | ~15.0.8 | Tactile feedback |
| `expo-clipboard` | ~8.0.8 | Copy to clipboard |
| `expo-blur` | ~15.0.8 | Blur effects |
| `expo-web-browser` | ~15.0.10 | In-app browser |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ~5.9.2 | Type checking |
| `eslint` | ^9.25.0 | Code linting |
| `eslint-config-expo` | ~10.0.0 | Expo ESLint rules |
| `@babel/core` | ^7.25.2 | JS transpilation |
| `@types/react` | ~19.1.0 | React type definitions |

---

## Quick Reference

### Key File Locations

| What | Where |
|------|-------|
| App entry point | [app/_layout.tsx](app/_layout.tsx) |
| Tab configuration | [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) |
| Environment config | [config/env.ts](config/env.ts) |
| Auth state | [store/authStore.ts](store/authStore.ts) |
| Chat state | [store/chatStore.ts](store/chatStore.ts) |
| Incident state | [store/fireReportsStore.ts](store/fireReportsStore.ts) |
| Station search | [utils/fireStationService.js](utils/fireStationService.js) |
| Input validation | [utils/validation.ts](utils/validation.ts) |
| Color palette | [constants/Colors.ts](constants/Colors.ts) |
| Image upload | [utils/cloudinary.ts](utils/cloudinary.ts) |

### Common Commands

```bash
npm start                     # Start dev server
npx expo start --clear        # Start with cleared cache
npm run android               # Open Android emulator
npm run ios                   # Open iOS simulator
npm run lint                  # Run ESLint
eas build --platform android  # Production Android build
eas build --platform ios      # Production iOS build
eas update --branch production # Push OTA update
```

---

*Fire Assistant — Built for Ghana. Powered by React Native and Expo.*
