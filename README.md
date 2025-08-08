# 🐾 Find Pet App (Achando um Lar)

A comprehensive React Native mobile application built with Expo that helps users find and adopt pets. The app connects pet owners with potential adopters through a modern, user-friendly interface with real-time chat functionality.

## 📱 App Overview

**Find Pet App** is a pet adoption platform that allows users to:
- Browse available pets for adoption
- Add their own pets for adoption
- Chat with other users in real-time
- Filter and search pets by various criteria
- View pets on an interactive map
- Manage their profile and pet listings

## ✨ Key Features

### 🏠 Core Functionality
- **Pet Discovery**: Browse pets available for adoption with detailed information
- **Pet Registration**: Add pets for adoption with multiple images and detailed descriptions
- **Real-time Chat**: Instant messaging between users using SignalR
- **Location-based Search**: Find pets near your location with distance calculations
- **Advanced Filtering**: Filter pets by type, breed, size, age, and gender
- **Map View**: Interactive map showing pet locations
- **User Profiles**: Complete user profile management with avatar upload

### 🔍 Search & Discovery
- **Smart Search**: Text-based search across pet names and descriptions
- **Multi-criteria Filters**: Filter by pet type, breed, size, age, gender
- **Location-based Results**: Sort pets by distance from user location
- **Map Integration**: Visual map view with pet markers
- **Image Galleries**: Multiple images per pet with carousel navigation

### 💬 Communication
- **Real-time Messaging**: Instant chat using SignalR WebSocket connections
- **Message Status**: Read receipts and delivery confirmations
- **Chat History**: Persistent message history
- **Online Status**: Real-time user online/offline indicators
- **Push Notifications**: Instant notifications for new messages

### 👤 User Management
- **Authentication**: Secure login using Clerk authentication
- **Profile Management**: Complete user profile with avatar upload
- **Social Login**: Google, Facebook, and Apple sign-in options
- **Address Management**: Full address information with CEP validation
- **Privacy Controls**: Notification preferences and data management

## 🏗️ Architecture

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router with file-based routing
- **Authentication**: Clerk for secure user authentication
- **Real-time Communication**: SignalR for WebSocket connections
- **State Management**: React Context API with custom hooks
- **Form Handling**: React Hook Form with Zod validation
- **Maps**: React Native Maps with Google Maps integration
- **Image Handling**: Expo Image Picker with FormData upload
- **Location Services**: Expo Location with geocoding
- **Push Notifications**: Expo Notifications
- **Styling**: Custom theme system with dark/light mode support

### Project Structure
```
src/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   └── (main)/            # Main app screens
├── components/             # Reusable UI components
│   └── Pets/              # Pet-specific components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── services/              # API and external service integrations
├── dtos/                  # Data Transfer Objects
├── models/                # TypeScript type definitions
├── enums/                 # Enumeration definitions
├── utils/                 # Utility functions
├── constants/             # App constants and configuration
└── types/                 # TypeScript type definitions
```

### Key Components

#### Authentication Flow
- **Clerk Integration**: Secure authentication with social login options
- **User Registration**: Complete user profile setup with avatar upload
- **Profile Management**: Update user information and preferences

#### Pet Management
- **Pet Registration**: Multi-step form with image upload
- **Pet Listing**: Grid and map views with filtering
- **Pet Details**: Comprehensive pet information display
- **Image Management**: Multiple image upload and gallery management

#### Real-time Chat
- **SignalR Integration**: WebSocket-based real-time messaging
- **Chat Rooms**: Private chat rooms between users
- **Message Persistence**: Chat history and message status
- **Push Notifications**: Instant message notifications

#### Location Services
- **GPS Integration**: Current location detection
- **Geocoding**: Address to coordinates conversion
- **Distance Calculation**: Pet proximity calculations
- **Map Integration**: Interactive map with pet markers

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd find-pet-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   EXPO_PUBLIC_API_URL=your_api_url
   EXPO_PUBLIC_GOOGLE_MAPS_API=your_google_maps_api_key
   EXPO_PUBLIC_CHAT_URL=your_signalr_chat_url
   ```

4. **Configure Google Services**
   - Add your `google-services.json` file to the `path/to/` directory
   - Update the path in `app.json` if needed

5. **Start the development server**
   ```bash
   npm start
   ```

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm test` - Run test suite

## 📱 App Screens

### Authentication Screens
- **Sign In**: Login with email/password or social accounts
- **Sign Up**: User registration with profile setup
- **Profile Setup**: Complete user profile configuration
- **Email Verification**: Account verification process

### Main App Screens
- **Home**: Pet discovery with search and filters
- **Add Pet**: Multi-step pet registration form
- **Pet Detail**: Comprehensive pet information
- **Chat**: Real-time messaging interface
- **Messages**: Chat room list and management
- **My Pets**: User's pet listings
- **Favorites**: Saved pet listings
- **Profile**: User profile management
- **Settings**: App configuration and preferences

## 🔧 Configuration

### API Endpoints
The app communicates with a backend API through the following endpoints:
- `/pet` - Pet management (CRUD operations)
- `/auth` - Authentication and user management
- `/chat` - Real-time chat functionality
- `/pet/images` - Pet image upload and management

### Environment Variables
- `EXPO_PUBLIC_API_URL`: Backend API base URL
- `EXPO_PUBLIC_GOOGLE_MAPS_API`: Google Maps API key
- `EXPO_PUBLIC_CHAT_URL`: SignalR chat hub URL

### App Configuration
- **Bundle ID**: `com.jaimetjr.findpetapp`
- **Platform Support**: iOS, Android, Web
- **Minimum SDK**: iOS 13.0, Android API 21
- **Orientation**: Portrait mode
- **Permissions**: Location, Camera, Photo Library, Notifications

## 🎨 UI/UX Features

### Design System
- **Theme Support**: Light and dark mode
- **Custom Components**: Reusable UI components
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Screen reader support and accessibility features

### User Experience
- **Intuitive Navigation**: File-based routing with Expo Router
- **Smooth Animations**: React Native Reanimated for fluid interactions
- **Loading States**: Comprehensive loading and error states
- **Offline Support**: Graceful handling of network issues
- **Performance Optimization**: Memoization and efficient rendering

## 🔒 Security & Privacy

### Authentication Security
- **Clerk Integration**: Enterprise-grade authentication
- **Token Management**: Secure token storage and refresh
- **Social Login**: Secure OAuth integration
- **Session Management**: Automatic session handling

### Data Protection
- **Form Validation**: Client-side validation with Zod
- **Input Sanitization**: Protection against malicious input
- **Secure Storage**: Encrypted local storage for sensitive data
- **API Security**: HTTPS communication with backend

## 📊 Performance

### Optimization Features
- **Image Optimization**: Efficient image loading and caching
- **Lazy Loading**: On-demand component and data loading
- **Memory Management**: Proper cleanup and memory optimization
- **Bundle Optimization**: Efficient code splitting and bundling

### Monitoring
- **Performance Tracking**: Custom performance monitoring hooks
- **Error Handling**: Comprehensive error tracking and reporting
- **Analytics**: User behavior and app usage analytics

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Jest testing framework
- **Component Tests**: React component testing
- **Integration Tests**: API and service testing
- **E2E Tests**: End-to-end user flow testing

### Quality Assurance
- **TypeScript**: Static type checking
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting consistency
- **Git Hooks**: Pre-commit validation

## 📦 Deployment

### Build Configuration
- **EAS Build**: Expo Application Services for cloud builds
- **Platform-specific**: Optimized builds for iOS and Android
- **Code Signing**: Automatic certificate and provisioning profile management
- **App Store Ready**: Production-ready builds for app stores

### Distribution
- **App Store**: iOS App Store deployment
- **Google Play**: Android Play Store deployment
- **Internal Testing**: TestFlight and internal testing builds
- **OTA Updates**: Over-the-air updates for development builds

## 🤝 Contributing

### Development Guidelines
1. Follow the existing code style and conventions
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Use TypeScript for all new code
5. Follow the Git flow branching strategy

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality rules enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **API Documentation**: Backend API reference
- **Component Library**: UI component documentation
- **Architecture Guide**: System design and patterns
- **Deployment Guide**: Build and deployment instructions

### Contact
For support and questions:
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions
- **Email**: [Your contact email]

## 🔄 Version History

### Current Version: 1.0.0
- Initial release with core pet adoption features
- Real-time chat functionality
- Location-based pet discovery
- Complete user management system
- Multi-platform support (iOS, Android, Web)

---

**Find Pet App** - Connecting pets with loving homes through technology. 🐾❤️
