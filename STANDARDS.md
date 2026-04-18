# Loopy App Development Standards

This file contains the strict coding rules and established architecture patterns that must be followed by Antigravity during Loopy App development. It is derived from the `Loopy_VibeCoding_BestPractices.pdf`.

## General Principles
- Use **Planning Mode** for all new features.
- Review plan before approving.
- One feature per session.
- Run `npm run lint` before committing.
- Commit working features only.

## Project Structure (Expo Router)
- `app/` - All screens and routes (1 screen per file, no business logic).
- `app/(tabs)/` - Tab navigation layouts (no data fetching).
- `app/(modals)/` - Modal overlay screens.
- `app/api/` - API route handlers (thin, call services).
- `components/` - Shared UI (dumb components, no API calls).
- `components/ui/` - Base design system components (read-only).
- `hooks/` - ALL data fetching and state logic (e.g., `useDeliveries`).
- `services/` - Axios API calls (one file per domain, e.g., `deliveryService.ts`).
- `lib/` - Pure utilities and helpers.
- `types/` - All TypeScript interfaces and API response types.
- `constants/` - App-wide constants (Colors, dimensions, APIs).
- `store/` - Context API state (focused and small: Auth, Theme).

## TypeScript
- Strict mode enabled. No `any` types.
- All interfaces mapped in `types/`.
- All props typed.
- Enums used for sets (e.g. `DeliveryStatus`).
- JSDoc comments on all hooks and service functions.

## Data Fetching
- Service layer (Axios) wrapped by React Query (`useQuery` / `useMutation`).
- Never import/call `axios` directly in components.
- Default query config: `enabled: !!isAuthenticated`, `retry: 2`, `staleTime: 30000`.
- Loadings states must use Skeletons. Errors must use a retry button.

## Navigation
- Expo Router (`import { router } from "expo-router"`).
- Never use React Navigation natively.
- Protect routes in `_layout.tsx`, not in screens.

## State Management
- `store/`: For Auth and Theme context only.
- React Query for feature data.
- `SecureStore` for JWT tokens & refresh tokens.
- `AsyncStorage` for non-sensitive cache & user preferences.

## UI/UX
- Poppins font (`constants/typography.ts`), Ionicons.
- Colors (`constants/colors.ts`) and Spacing (`constants/layout.ts`).
- React Native Reanimated for animations. Haptics via `expo-haptics` for key interactions.
- Use the Antigravity Browser Agent to visually check 375px/768px widths.

## Hardware
- Request permissions gracefully.
- Handle failures (GPS off, Camera denied).
- Compress photos to < 500KB.

## Build and Testing
- Jest for Services, RNTL for Components, Maestro for E2E.
- EAS Build for preview & production. Semantic versioning. Android AAB, iOS IPA.
