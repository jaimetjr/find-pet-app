# FindPet MAUI

This directory contains a minimal .NET MAUI project that serves as a starting point for porting the React Native app to MAUI.

It includes a basic `App` setup with a single `MainPage`. Additional pages and features from the original React Native project will need to be implemented in MAUI.

To build or run this project locally you need the .NET SDK with MAUI workloads installed:

```bash
# build
dotnet build

# run for a specific platform (e.g., android)
dotnet build -t:Run -f net8.0-android
```

This skeleton is not feature-complete but provides the structure to begin migrating components from the existing codebase.
