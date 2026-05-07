# Fire Assistant 🚒

A comprehensive mobile application designed to provide fire emergency services and safety information to users in Ghana. Built with React Native and Expo, this app connects users with nearby fire stations, provides emergency reporting capabilities, and offers AI-powered safety assistance.

## 🌟 Features

### Core Functionality
- **Emergency Contact System**: Quick access to nearby fire stations with live location data
- **Incident Reporting**: Submit and track emergency reports with priority levels
- **AI-Powered Chat Assistant**: Get instant fire safety advice and emergency guidance
- **Real-time Location Services**: Location-aware fire station discovery and routing
- **News & Safety Tips**: Stay informed with fire safety news and daily tips
- **Weather Integration**: Weather-aware safety recommendations

### Smart Fire Station Discovery
- Utilizes Google Places API for comprehensive fire station database
- Service area mapping for remote locations in Ghana
- Route distance calculation and response time estimation
- Phone number integration for direct emergency contact
- Proximity scoring algorithm for optimal station recommendations

## 🏗️ Architecture

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand for chat functionality
- **UI Components**: Custom components with Expo Vector Icons
- **Maps**: React Native Maps integration
- **Backend API**: Node.js/Express server (separate repository)
- **Location Services**: Expo Location with context management

### Project Structure
```
fire-assistant/
├── app/                      # App screens and routing
│   ├── (tabs)/               # Tab navigation screens
│   │   ├── index.tsx         # Home screen
│   │   ├── ai-chat.tsx       # AI chat interface
│   │   ├── incidents.tsx     # Incident reports
│   │   ├── news-feed.tsx     # News and updates
│   │   ├── notification.tsx  # Notifications
│   │   └── profile.tsx       # User profile
│   ├── login.tsx             # Authentication screens
│   ├── signup.tsx
│   ├── onboarding.tsx
│   └── _layout.tsx           # Root layout
├── components/               # Reusable UI components
│   ├── AnimatedScreen.tsx    # Screen transitions
│   ├── Header.tsx            # Navigation header
│   ├── HomeGeneralTab.tsx    # Main dashboard
│   ├── IncidentReportModal.tsx # Emergency reporting
│   ├── LocationSearch.tsx    # Location picker
│   ├── WeatherCard.tsx       # Weather display
│   ├── NewsCard.tsx          # News articles
│   ├── FireStationsCard.tsx  # Station listings
│   └── ui/                   # Base UI components
├── context/                  # React contexts
│   └── LocationContext.tsx   # Location state management
├── store/                    # State management
│   └── chatStore.ts          # Chat functionality
├── utils/                    # Utility functions
│   ├── fireStationService.js # Station search logic
│   └── fireStationSearch.ts  # Location algorithms
├── constants/                # App constants
├── styles/                   # Global styles
└── assets/                   # Images, fonts, icons
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio (for emulators)
- Google Maps API key (for location services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fire-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update the Google Maps API key in `utils/fireStationService.js`
   - Configure backend API URL in `store/chatStore.ts`

4. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device testing

## 🔐 Demo Credentials

For live demonstration, testing, and evaluation of the application, please use the following official credentials:

### 🧑‍🚒 Officer Account
* **ID / Username**: `GNFS-1113`
* **Password**: `latif@123`
* **Demo Station Action**: Please select or use the **University of Ghana Fire Station** for the demonstration flows.

### 🌐 Admin Portal
The central command and dispatcher dashboard can be accessed online at:
* **Primary Link**: [gnfs.ekowlabs.space/station-admin/login](https://gnfs.ekowlabs.space/station-admin/login)
* **Alternative Link**: [gnfs.ekowlabs.tech/station-admin/login](https://gnfs.ekowlabs.tech/station-admin/login)

## 📱 App Navigation

### Authentication Flow
1. **Splash Screen** → **Onboarding** → **Login/Signup** → **Main App**
2. Uses Expo SecureStore for persistent authentication state

### Main Navigation (Tab-based)
- **Home**: Dashboard with fire stations, weather, news, and quick actions
- **AI Chat**: Intelligent fire safety assistant with conversation history
- **Incidents**: Emergency report submission and tracking
- **News**: Fire safety news and updates
- **Notifications**: System alerts and updates
- **Profile**: User settings and account management

## 🖥 UI Screens

### Splash & Onboarding
- **Splash Screen**: Fullscreen logo animation against primary red background; transitions to onboarding.
- **Onboarding**: Swipeable slides with illustrations, brief explanations of key features, "Get Started" button.

### Authentication Screens
- **Login**: Email/phone and password fields, "Forgot password?" link, primary button, social login icons maybe, light background.
- **Signup / Register**: Similar layout to login with name field, terms and conditions checkbox, and "Sign Up" button.
- **Forgot Password**: Input for email/phone, "Send Reset Link" button.
- **New Password / Reset**: Two password fields with visibility toggle, submit button.
- **Verify**: Code input fields with resend timer and submit.

### Main Tab Screens

#### Home
- Top header with location display and search icon.
- Scrollable content: Quick action cards (Report Incident, Find Station), WeatherCard at top with current conditions.
- FireStationsCard list showing nearest stations with name, distance, call button.
- NewsCard preview for latest safety news.
- Pull-to-refresh and floating action button for reporting.

#### AI Chat
- Chat bubbles: user messages right-aligned in primary color, assistant messages left in light gray.
- Text input bar with microphone and send icon.
- Category chips above input to switch conversation mode.
- Scrollable conversation with auto-scroll to latest message.

#### Incidents
- List of past reports: each entry shows type icon, timestamp, status badge.
- Floating "+" button to open `IncidentReportModal`.
- Modal with incident type selectors, priority slider, location picker (via `LocationSearch`), description textarea, submit.

#### News Feed
- Vertical list of `NewsCard` components: image thumbnail, title, source and date.
- Tap opens full article in webview.

#### Notifications
- List view with alert icons, short message, timestamp.
- Swipe actions to dismiss or archive.
- Clear all button in header.

#### Profile
- Display of user avatar, name, email.
- Settings options: Edit profile, change password, notification preferences, logout.
- Footer with app version.

#### Fire Station Detail (accessible from Home list)
- Map preview, contact info (phone, address), distance, request directions button.
- Station service hours and notes.

### Modal & Overlay Components
- **IncidentReportModal** (described above).
- **LocationSearch**: Search bar with autocomplete, map view for selecting location.
- **CustomAlert**: Reusable popup for confirmations and error messages.
- **ToastNotification**: Temporary toast at top/bottom for status messages.

## 🔧 Key Components

### Fire Station Discovery (`fireStationService.js`)
- **Primary Search**: Google Places API integration
- **Service Area Mapping**: Predefined coverage areas for remote locations
- **Phone Number Fetching**: Automatic contact information retrieval
- **Route Calculation**: Distance and travel time estimation
- **Proximity Scoring**: Intelligent ranking algorithm

### Location Management (`LocationContext.tsx`)
- Real-time location tracking
- Permission handling
- Location-aware service discovery
- Geocoding and reverse geocoding

### Chat System (`chatStore.ts`)
- Session-based conversations
- Typewriter effect for AI responses
- Message persistence
- Category-based organization

### Emergency Reporting (`IncidentReportModal.tsx`)
- Multiple incident types (fire, medical, accident, etc.)
- Priority classification
- Location attachment
- Direct emergency calling

## 🌍 Ghana-Specific Features

### Service Area Coverage
The app includes predefined service areas for major Ghanaian regions:
- **Greater Accra**: East Legon, Dome-Kwabenya, Botwe, Achimota
- **Tema Industrial Area**: Port and industrial zones
- **Central Region**: Kasoa and surrounding areas
- **Extensible**: Easy addition of new coverage areas

### Local Integration
- Ghana Fire Service contact information
- Local emergency protocols
- Regional news sources
- Culturally appropriate UI/UX patterns

## 🔌 API Integration

### External APIs
- **Google Places API**: Fire station discovery and details
- **Google Maps API**: Location services and routing
- **Weather API**: Real-time weather data
- **News APIs**: Local fire safety news

### Backend Requirements
The app requires a backend service for:
- AI chat functionality
- User authentication
- Incident report storage
- News aggregation

**Expected API Endpoints**:
```
POST   /api/chat                    # Create chat session
POST   /api/chat/:id/message       # Send message
GET    /api/chat                   # Get chat sessions
POST   /api/incidents              # Submit incident report
GET    /api/incidents              # Get incident reports
POST   /api/auth/login            # User authentication
POST   /api/auth/register         # User registration
```

## 🎨 Design System

### Color Palette
```typescript
const Colors = {
  primary: "#D32F2F",        // Fire engine red
  primaryLight: "#FF6659",   // Light red
  primaryDark: "#9A0007",    // Dark red
  secondary: "#1A1A1A",      // Dark gray
  tertiary: "#6B7280",       // Medium gray
  background: "#F8FAFC",     // Light background
  surface: "#FFFFFF",        // White surfaces
  success: "#10B981",        // Green
  warning: "#F59E0B",        // Orange
  danger: "#EF4444",         // Red
  accent: "#8B5CF6",         // Purple
};
```

### Typography
- **Primary Font**: System default (San Francisco/Roboto)
- **Monospace**: Space Mono (for technical displays)
- **Accessibility**: High contrast ratios throughout

## 🧪 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Open Android emulator
npm run ios        # Open iOS simulator
npm run web        # Open web browser
npm run lint       # Run ESLint
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Expo configuration
- **Prettier**: Automatic code formatting
- **Path Mapping**: `@/*` aliases for clean imports

### Testing Strategy
- Component testing with React Native Testing Library
- Integration testing for core user flows
- Location service mocking for consistent testing
- API endpoint mocking

## 📦 Dependencies

### Core Dependencies
```json
{
  "expo": "~53.0.20",
  "react": "19.0.0",
  "react-native": "0.79.5",
  "expo-router": "~5.1.4",
  "zustand": "^5.0.6",
  "axios": "^1.11.0"
}
```

### Key Expo Modules
- **expo-location**: GPS and location services
- **expo-maps**: Map integration
- **expo-secure-store**: Secure data storage
- **expo-linear-gradient**: UI gradients
- **expo-haptics**: Tactile feedback
- **expo-web-browser**: In-app browsing

## 🚢 Deployment

### Build Configuration
- **iOS**: Requires Apple Developer Account
- **Android**: Uses Android Keystore
- **Web**: Static export available
- **EAS Build**: Recommended for production builds

### Environment Setup
1. Configure `app.json` with production settings
2. Set up environment variables for API keys
3. Configure push notification services
4. Set up analytics and crash reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**Built with ❤️ for fire safety in Ghana**
