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

1. Clone the repository
   ```bash
   git clone https://github.com/MarwanMashaly1/MacrosAI.git
   cd MacrosAI
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Pull the Cloud Backend
   ```bash
   amplify pull --appId d2xeviacwqqffq --envName dev
   ```

4. Amplify will ask:
   ```bash
   Do you want to use an existing environment? Yes
   Choose your default editor: <whatever>
   Choose your type of app: javascript
   Where is your src directory: src
   Where is your dist directory: dist (or build)
   Do you want to generate code for your models? No
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
