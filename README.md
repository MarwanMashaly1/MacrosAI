# MacrosAI 🥗

A React Native app with AWS Amplify backend for macro tracking and meal management.

## Features

- **User Authentication**: Sign up, sign in, and auto-confirmation with AWS Cognito
- **Meal Tracking**: Track macros and meals with AWS backend
- **Image Storage**: Upload and manage meal photos with AWS S3
- **Cross-Platform**: Works on iOS, Android, and Web

## Get started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- AWS Amplify CLI (`npm install -g @aws-amplify/cli`)
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository and checkout the auth branch
   ```bash
   git clone https://github.com/MarwanMashaly1/MacrosAI.git
   cd MacrosAI
   git checkout auth
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Pull the Cloud Backend
   ```bash
   amplify pull --appId d2xeviacwqqffq --envName dev
   ```
   
   **Note**: This step is crucial! It generates the `aws-exports.js` configuration file that the app needs to connect to AWS services. Without this file, the app won't work.

4. Amplify will prompt you with these questions:
   ```bash
   ? Select the authentication method you want to use: AWS profile
   ? Please choose the profile you want to use: nbeau
   ? Choose your default editor: Visual Studio Code
   ? Choose the type of app that you're building: javascript
   ? What javascript framework are you using: react-native
   ? Source Directory Path: src
   ? Distribution Directory Path: /
   ? Build Command: npm run-script build
   ? Start Command: npm run-script start
   ? Do you plan on modifying this backend? No (unless you're a core developer)
   ```

5. Start the app
   ```bash
   npx expo start
   ```

## Development Options

In the output, you'll find options to open the app in a:

- [Web browser](http://localhost:8081) - Press `w` in the terminal
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/) - Press `i` in the terminal
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/) - Press `a` in the terminal
- [Expo Go](https://expo.dev/go) - Scan QR code with Expo Go app

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Backend Architecture

This app uses AWS Amplify with:
- **AWS Cognito** for user authentication with auto-confirmation
- **AWS Lambda** for serverless functions (meal processing, image triggers)
- **AWS S3** for image storage
- **AWS AppSync/GraphQL** for API layer

## Project Structure

```
app/                    # Main application code
  ├── _layout.tsx      # Root layout with AuthContext
  ├── index.tsx        # Home page
  ├── login.tsx        # Login screen
  ├── signup.tsx       # Signup screen
  └── AuthContext.tsx  # Authentication state management
amplify/               # AWS Amplify backend configuration
  ├── backend/         # Backend resources
  └── team-provider-info.json
src/                   # Additional source files
  └── components/      # Reusable React components
```
