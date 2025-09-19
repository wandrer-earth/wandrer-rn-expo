# Wandrer React Native Expo

A React Native application built with Expo for the Wandrer platform, featuring interactive mapping, GPS tracking, and activity recording capabilities.

## Features

- **Interactive Mapping**: MapLibre-powered maps with satellite and normal view modes
- **GPS Tracking**: Multi-mode location tracking (off, follow, compass)
- **Activity Recording**: Record and track cycling and walking activities
- **Layer Management**: Customizable map layers and overlays
- **User Authentication**: Secure user profiles and session management
- **Offline Support**: Local data storage with AsyncStorage
- **Cross-Platform**: iOS, Android, and Web support

## Tech Stack

- **React Native**: 0.81.4 with new architecture enabled
- **Expo**: SDK 54 for development and build tooling
- **TypeScript**: 5.9 for type safety and better development experience
- **MapLibre**: Modern mapping library for interactive maps
- **Zustand**: Lightweight state management
- **React Query**: Data fetching and caching
- **Expo Router**: File-based navigation system

## Getting Started

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh/) (package manager)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wandrer-rn-expo
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your API keys and configuration.

4. Start the development server:
```bash
bun start
```

### Development Commands

- `bun start` - Start Expo development server
- `bun run ios` - Run on iOS simulator
- `bun run android` - Run on Android emulator
- `bun run web` - Run web version

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   ├── forms/           # Form-specific components
│   ├── map/             # Map-related components
│   └── ride/            # Activity recording components
├── stores/              # Zustand state stores
├── styles/              # Design system (colors, typography, spacing)
├── utils/               # Utility functions
├── constants/           # App constants and configuration
└── providers/           # Context providers

app/                     # Expo Router pages
├── (auth)/             # Authentication screens
├── (tabs)/             # Main tabbed navigation
└── layers-modal.tsx    # Map layers modal

assets/                  # Static assets (images, icons)
```

### Key Components

- **MapView**: Core mapping component with GPS tracking
- **MapControls**: Zoom, GPS, and layer toggle controls
- **MapLayers**: Configurable map layer system
- **RecordingControls**: Activity recording interface
- **Design System**: Centralized styling with colors, typography, and spacing

### State Management

The app uses Zustand for state management with the following stores:

- `userStore`: User authentication and profile data
- `mapSettingsStore`: Map configuration and preferences
- `locationStore`: GPS location and tracking state
- `rideStore`: Activity recording and ride data
- `authStore`: Authentication state and tokens

## Development

### Environment Variables

Required environment variables in `.env`:

```env
EXPO_PUBLIC_MAPTILER_API_KEY=your_maptiler_key
# Add other required API keys and configuration
```

### iOS Development

If you encounter Ruby/CocoaPods errors when running `bun run ios`, use:

```bash
export PATH="/opt/homebrew/bin:$PATH"
bun run ios
```

This ensures the Homebrew-installed CocoaPods is used instead of the system version.

### Build Configuration

- **Bundle Identifier**: `com.wandrer.wandrerrnexpo`
- **New Architecture**: Enabled via `newArchEnabled: true`

## Architecture

### Component Architecture

Components follow a hierarchical structure with clear separation of concerns:

- **Presentation Components**: UI-only components with props interface
- **Container Components**: Components that manage state and business logic
- **Shared Components**: Reusable components used across features

### State Management Patterns

- **Local State**: React hooks for component-specific state
- **Global State**: Zustand stores for app-wide state
- **Server State**: React Query for API data management
- **Persistent State**: AsyncStorage for offline data

### API Integration

- RESTful API calls using Axios
- React Query for caching and synchronization
- Offline-first approach with local fallbacks
- Error handling and retry mechanisms

### Styling Approach

The app implements a centralized design system:

- **Colors**: Semantic color palette with dark/light mode support
- **Typography**: Modular scale typography system
- **Spacing**: Consistent spacing values across components
- **Components**: Reusable styled components with design tokens