# Migration Plan: Wandrer React Native to Expo

## Overview
This document outlines the plan to migrate the existing `wandrer-react-native` project to this new Expo SDK 53 project. **MapLibre integration is prioritized as Phase 1** since it's the biggest project dependency and must be working before other features can be built.

## Phase 1: MapLibre Integration (PRIORITY)

MapLibre React Native now supports Expo! 🎉 **This is our first priority since map rendering is critical to the entire application.**

**Setup Steps:**
1. Install `@maplibre/maplibre-react-native`
2. Configure the Expo config plugin in `app.json`
3. Create basic map component to verify rendering works
4. Test on development client (iOS/Android)
5. No native code changes needed - the plugin handles everything

**Configuration:**
```json
{
  "expo": {
    "plugins": [
      [
        "@maplibre/maplibre-react-native",
        {
          "RNMapboxMapsDownloadToken": "your_token_here"
        }
      ]
    ]
  }
}
```

**Success Criteria:**
- Map renders on iOS development client
- Map renders on Android development client
- Basic map interactions work (pan, zoom)
- Ready for core app features to be built on top

## Phase 2: Core Dependencies Installation

### Keep Compatible Packages (Install First)
- **MapLibre GL Native** - `@maplibre/maplibre-react-native` (✅ Already done in Phase 1!)
- Redux ecosystem (redux, react-redux, redux-saga, redux-persist)
- Navigation (@react-navigation/*)
- UI libraries (native-base, react-native-elements, react-native-vector-icons)
- Turf.js libraries for geospatial operations
- Most React Native community packages

### Replace Incompatible Packages with Expo Alternatives
- `react-native-splash-screen` → `expo-splash-screen`
- `react-native-branch` → `expo-linking` + Branch SDK
- `react-native-onesignal` → `expo-notifications` or OneSignal Expo plugin
- `react-native-permissions` → `expo-location`, `expo-camera`, etc.
- `react-native-fs` → `expo-file-system`
- `react-native-geolocation-service` → `expo-location`
- `react-native-keep-awake` → `expo-keep-awake`
- `react-native-push-notification` → `expo-notifications`
- `react-native-localize` → `expo-localization`

## Phase 3: Basic App Structure & Map Integration

1. **Copy core map components** from source (`/src/components/map/`)
   - MapView component
   - Map-related utilities
   - Geospatial helpers

2. **Update App.tsx**
   - Add basic map rendering to verify everything works
   - Set up minimal Redux store if needed for map state
   - Test map renders before adding other features

## Phase 4: Source Code Migration

1. **Copy remaining source structure** (`/src` folder)
   - All components (activity, dashboard, settings, etc.)
   - Redux stores and sagas
   - Services and utilities
   - Assets and styles
   - Hooks and contexts

2. **Update entry point**
   - Integrate full Splash.js logic
   - Complete Redux Provider and Navigation setup
   - Update imports for Expo packages

## Phase 5: Native Module Replacements

### Location Services
- Replace `react-native-geolocation-service` with `expo-location`
- Update permission handling

### File System
- Replace `react-native-fs` with `expo-file-system`
- Update file operations for GPX exports

### Push Notifications
- Implement `expo-notifications`
- Configure OneSignal if needed via config plugin

### Splash Screen
- Use `expo-splash-screen` instead of `react-native-splash-screen`

## Phase 6: Configuration & Build

### Update app.json
- Add iOS bundle identifier: `com.wandrer.app`
- Configure permissions (location, notifications)
- Add splash screen configuration
- Set up app icons

### Configure EAS Build
- Add custom native dependencies via plugins
- Configure development and production builds

## Phase 6: Testing & Optimization

1. Test all migrated features
2. Verify map functionality
3. Test location tracking
4. Verify push notifications
5. Test file operations (GPX export)
6. Performance optimization

## Key Challenges

- **MapLibre GL Native** - ✅ **Resolved!** Now has official Expo support
- **OneSignal** - May need custom config plugin
- **Branch deep linking** - Needs proper Expo configuration

## Recommended Approach

Start with Phase 1-2 to get the core app running, then tackle native modules one by one. **MapLibre integration is now much simpler** with official Expo support, so this is no longer the biggest blocker!

## Current Project Structure (Source)

```
wandrer-react-native/
├── src/
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # UI components
│   │   ├── activity/
│   │   ├── dashboard/
│   │   ├── map/         # MapLibre integration
│   │   ├── settings/
│   │   └── ...
│   ├── hooks/
│   ├── sagas/           # Redux-saga logic
│   ├── services/        # API calls
│   ├── stores/          # Redux stores
│   ├── utils/
│   ├── Navigator.js     # Navigation setup
│   └── Splash.js        # App entry point
├── ios/                 # Native iOS code
├── android/             # Native Android code
└── package.json         # Dependencies
```

## Target Project Structure

```
wandrer-rn-expo/
├── src/                 # Migrated from source
├── assets/             # App icons, splash screens
├── App.tsx             # Main entry point
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
└── package.json        # Expo dependencies
```