# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application using Expo SDK 53 with TypeScript support. The project is configured for cross-platform development (iOS, Android, Web) and uses the new React Native architecture with `newArchEnabled: true`.

## Development Commands

- `npm start` or `expo start` - Start the Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator  
- `npm run web` - Start web version

## Project Structure

- `App.tsx` - Main application component (entry point for UI)
- `index.ts` - Root component registration using `registerRootComponent`
- `app.json` - Expo configuration including app metadata, build settings, and platform-specific configs
- `eas.json` - EAS Build configuration for development builds with simulator support
- `assets/` - Application assets (icons, splash screens, favicon)

## Key Configuration Details

- **Bundle Identifier**: `com.wandrer.wandrerrnexpo`
- **EAS Project ID**: `5ac03ac8-0a2a-4318-8e67-158a1af3a9b6`
- **TypeScript**: Configured with strict mode enabled
- **New Architecture**: Enabled via `newArchEnabled: true` in app.json
- **Development Client**: Configured for EAS development builds

## Dependencies

- React 19.0.0
- React Native 0.79.6
- Expo SDK ~53.0.22
- TypeScript ~5.8.3

## Build & Development

This project uses EAS for builds. The development configuration supports:
- Development client builds
- Internal distribution
- iOS simulator builds