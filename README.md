# MacrosAI Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Google Gemini API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MacrosAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Google Gemini API key:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

   **Get your API key:**
   - Visit https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Create a new API key
   - Copy and paste it into your `.env` file

4. **Start the development server**
   ```bash
   npm start
   ```

   Or run directly on a platform:
   ```bash
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   npm run web      # Web browser
   ```

## Important Notes

### Environment Variables in Expo

- Expo requires environment variables to be prefixed with `EXPO_PUBLIC_` to be accessible in the app
- The `.env` file is automatically loaded by Expo SDK 54+
- **You must restart the development server** after changing `.env` values
- Never commit your `.env` file (it's already in `.gitignore`)

### Troubleshooting

**API key not working?**
1. Verify the `.env` file exists in the project root
2. Ensure the variable is named `EXPO_PUBLIC_GEMINI_API_KEY` (not just `GEMINI_API_KEY`)
3. Restart the Expo development server completely (`Ctrl+C` then `npm start`)
4. Clear the cache: `npx expo start --clear`

See the AWS documentation for detailed setup instructions.

## Development

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## Project Structure

```
MacrosAI/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── services/              # Business logic
│   ├── geminiService.ts   # AI integration
│   ├── storageService.ts  # Local storage
│   └── api.ts            # Backend API calls
├── context/              # React Context providers
├── components/           # Reusable components
├── .env                  # Environment variables (create this!)
└── .env.example          # Environment template
```
