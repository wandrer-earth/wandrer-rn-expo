# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Instructions

You are an engineer who writes code for **human brains, not machines**. You favour code that is simple to undertand and maintain. Remember at all times that the code you will be processed by human brain. The brain has a very limited capacity. People can only hold ~4 chunks in their working memory at once. If there are more than four things to think about, it feels mentally taxing.

Here's an example that's hard for people to understand:
```
if val > someConstant // (one fact in human memory)
    && (condition2 || condition3) // (three facts in human memory), prev cond should be true, one of c2 or c3 has be true
    && (condition4 && !condition5) { // (human memory overload), we are messed up by this point
    ...
}
```

A good example, introducing intermediate variables with meaningful names:
```
isValid = val > someConstant
isAllowed = condition2 || condition3
isSecure = condition4 && !condition5 
// (human working memory is clean), we don't need to remember the conditions, there are descriptive variables
if isValid && isAllowed && isSecure {
    ...
}
```

- No useless "WHAT" comments, don't write a comment if it duplicates the code. Only "WHY" comments, explaining the motivation behind the code, explaining an especially complex part of the code or giving a bird's eye overview of the code.
- Make conditionals readable, extract complex expressions into intermediate variables with meaningful names.
- Prefer early returns over nested ifs, free working memory by letting the reader focus only on the happy path only.
- Prefer composition over deep inheritance, don’t force readers to chase behavior across multiple classes.
- Don't write shallow methods/classes/modules (complex interface, simple functionality). An example of shallow class: `MetricsProviderFactoryFactory`. The names and interfaces of such classes tend to be more mentally taxing than their entire implementations. Having too many shallow modules can make it difficult to understand the project. Not only do we have to keep in mind each module responsibilities, but also all their interactions.
- Prefer deep method/classes/modules (simple interface, complex functionality) over many shallow ones. 
- Don’t overuse language featuress, stick to the minimal subset. Readers shouldn't need an in-depth knowledge of the language to understand the code.
- Use self-descriptive values, avoid custom mappings that require memorization.
- Don’t abuse DRY, a little duplication is better than unnecessary dependencies.
- Avoid unnecessary layers of abstractions, jumping between layers of abstractions is mentally exhausting, linear thinking is more natural to humans.

## Project Overview

This is a React Native application using Expo SDK 53 with TypeScript support. The project is configured for cross-platform development (iOS, Android, Web) and uses the new React Native architecture with `newArchEnabled: true`.

## Package Manager

This project uses **Bun** as the package manager. Use `bun` commands instead of `npm`.

## Development Commands

- `bun start` or `expo start` - Start the Expo development server
- `bun run android` - Start on Android device/emulator
- `bun run ios` - Start on iOS device/simulator  
- `bun run web` - Start web version
- `bun install` - Install dependencies
- `bun add <package>` - Add new dependency
- `bun remove <package>` - Remove dependency

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

### CocoaPods Issue Fix

If you encounter Ruby/CocoaPods errors when running `expo run:ios`, use the Homebrew-installed CocoaPods instead:

Set PATH to prioritize Homebrew CocoaPods:
```bash
export PATH="/opt/homebrew/bin:$PATH"
npx expo run:ios
```