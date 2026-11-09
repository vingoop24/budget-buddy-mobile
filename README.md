# Budget Buddy Mobile

AI-powered personal finance app built with React Native and Expo (SDK 56).

## Features

- **Home:** monthly spending vs. budget, progress bar, category chart, insights,
  recent expenses; switch between months
- **Expenses:** every expense with month / all-time, category and search filters;
  tap to edit, add manually, delete with confirmation
- **Assistant:** chat with the AI about your spending, with suggested questions
- **Budget:** set the monthly amount and currency; shows the server connection status
- **Scan receipt:** take a photo or pick one, review the fields that were read
  (anything the scan couldn't read is highlighted), then save. Nothing is saved
  until you confirm.

## Getting started

1. Start the [API](https://github.com/vingoop24/budget-buddy-api) with
   `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.
2. Install and run the app:

   ```bash
   npm install
   npm start          # then press i / a / w, or scan the QR code
   ```

The app finds the API on port 8000 of the computer running `expo start`, so a
physical phone on the same Wi-Fi works without changes. To use another server,
set `EXPO_PUBLIC_API_URL`, for example in `.env`:

```
EXPO_PUBLIC_API_URL=https://budget-buddy.example.com
```

Check the **Budget** tab to see which address the app is using and whether it's connected.

## Scripts

- `npm start`, `npm run ios`, `npm run android`, `npm run web`
- `npm run typecheck`

## Project layout

```
src/app/(tabs)/       index (home), expenses, assistant, budget
src/app/expense/      new.tsx, [id].tsx (edit) — modals
src/app/scan-receipt.tsx
src/components/       shared UI, expense form/row, month picker
src/hooks/use-api.ts  load-on-focus data hook
src/lib/              API client, types, formatting, confirm dialogs
```

## Tech stack

React Native, Expo Router (native tabs), TypeScript, react-native-chart-kit,
expo-image-picker, FastAPI backend.
