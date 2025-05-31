# Fitness Tracker App

## Project Overview

Fitness Tracker is a cross-platform mobile application built with React Native, designed to help users monitor and improve their physical activity and overall health. The app targets individuals who want to track their daily steps, log workouts, monitor calorie intake, set fitness goals, and visualize their progress over time. With a user-friendly interface and real-time data synchronization, Fitness Tracker empowers users to stay motivated and achieve their wellness objectives.

## Features

- **Step Tracking:** Automatically records daily steps using device sensors.
- **Workout Logs:** Log various workouts, including type, duration, and calories burned.
- **Calorie Tracking:** Input daily calorie intake and monitor nutritional goals.
- **Progress Reports:** Visualize activity trends with charts and statistics (daily, weekly, monthly).
- **Reminders:** Receive notifications to encourage activity, hydration, and healthy habits.
- **Goal Setting:** Set and adjust step, workout, and calorie goals.
- **User Authentication:** Secure sign-up, login, OTP verification, and password reset.
- **Profile Management:** Edit personal information and preferences.
- **Dark/Light Mode:** Customize appearance for better user experience.
- **Settings:** Manage app preferences and permissions.

## Tech Stack

- **React Native** (TypeScript)
- **React Navigation** (stack, bottom tabs)
- **Native modules:** Sensors, device info, permissions, vector icons, etc.
- **Jest:** Testing framework

## File Structure

```
FitnessTracker/
├── App.tsx                # Main app entry point, navigation
├── components/            # Reusable UI components (charts, cards, settings, etc.)
├── hooks/                 # Custom React hooks and context
├── lib/                   # Utility functions, data, and interfaces
│   └── utils/             # Utility helpers (db, toast, apis)
├── routes/                # Navigation routes
├── screens/               # App screens (Home, Profile, Login, etc.)
├── android/               # Android native project files
├── ios/                   # iOS native project files
├── __tests__/             # Test files
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
└── ...                    # Other config and support files
```

## Packages Used

- **@react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/native-stack:** Navigation
- **@gorhom/bottom-sheet:** Bottom sheet UI
- **@react-native-async-storage/async-storage:** Local storage
- **react-native-sensors:** Step and activity tracking
- **react-native-device-info:** Device information
- **react-native-permissions:** Permissions handling
- **react-native-gifted-charts, react-native-svg:** Charts and graphs
- **react-native-vector-icons:** Icon library
- **react-native-toast-message:** Toast notifications
- **axios:** HTTP requests
- **moment:** Date/time utilities
- **jest:** Testing

## How to Run Locally

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **Yarn**
- **React Native CLI** (`npm install -g react-native-cli`)
- **Android Studio** (for Android) or **Xcode** (for iOS)
- **CocoaPods** (for iOS, `sudo gem install cocoapods`)

### Setup Steps

1. **Clone the repository:**
   ```pwsh
   git clone https://github.com/your-username/FitnessTracker.git
   cd FitnessTracker
   ```
2. **Install dependencies:**
   ```pwsh
   npm install
   # or
   yarn install
   ```
3. **iOS setup (macOS only):**
   ```pwsh
   cd ios
   pod install
   cd ..
   ```
4. **Start Metro bundler:**
   ```pwsh
   npm start
   # or
   yarn start
   ```
5. **Run the app:**
   - **Android:**
     ```pwsh
     npm run android
     # or
     yarn android
     ```
   - **iOS:**
     ```pwsh
     npm run ios
     # or
     yarn ios
     ```

## Usage

- **Sign Up / Login:** Create an account or log in with your credentials.
- **Set Goals:** On first login, set your step, workout, and calorie goals.
- **Track Steps:** The home screen displays your daily step count and progress.
- **Log Workouts:** Add new workout entries from the workout/history screen.
- **Calorie Tracking:** Log meals and monitor intake.
- **View Progress:** Access charts and reports to visualize your activity trends.
- **Reminders:** Enable notifications for activity and hydration reminders.
- **Profile & Settings:** Edit your personal information and app preferences.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a Pull Request describing your changes.

Please follow the code style and add tests for new features when possible.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---
