# 💖 Tezā — Feature & Module Reference

> **Tezā** is a real-time couple companion Progressive Web App (PWA) built on a 100% free-tier architecture.  
> This document catalogues every feature module, service layer, and technology used in the codebase.

---

## Table of Contents

- [Technology Stack](#-technology-stack)
- [Feature Modules](#-feature-modules)
  - [Authentication & User Identity](#1-authentication--user-identity)
  - [Couple Pairing & Relationship Management](#2-couple-pairing--relationship-management)
  - [Live Status & Mood Sharing](#3-live-status--mood-sharing)
  - [Plans & Shared Calendar](#4-plans--shared-calendar)
  - [Proposals & Date Suggestions](#5-proposals--date-suggestions)
  - [Memories & Shared Gallery](#6-memories--shared-gallery)
  - [Notifications System](#7-notifications-system)
  - [Settings & Preferences](#8-settings--preferences)
  - [Activity Feed & Timeline](#9-activity-feed--timeline)
  - [PWA & Offline Support](#10-pwa--offline-support)
  - [Landing Page](#11-landing-page)
- [Architecture Overview](#-architecture-overview)
- [Design System](#-design-system)
- [Database Schema](#-database-schema)
- [Supabase Integration Map](#-supabase-integration-map)
- [Route Map](#-route-map)

---

## 🧬 Technology Stack

### Frontend Core

| Technology | Version | Purpose |
|:---|:---|:---|
| [React](https://react.dev/) | `19.x` | UI framework (concurrent features, hooks) |
| [Vite](https://vite.dev/) | `6.x` | Build tool, dev server, HMR |
| [TypeScript](https://www.typescriptlang.org/) | `5.7` | Static type system across the entire codebase |
| [React Router](https://reactrouter.com/) | `v7` | Client-side routing with nested layouts |

### State & Data Management

| Technology | Version | Purpose |
|:---|:---|:---|
| [TanStack Query](https://tanstack.com/query) | `v5` | Server-state caching, background refetching, optimistic updates |
| [Zustand](https://zustand-demo.pmnd.rs/) | `5.x` | Lightweight client-state management (auth, app, relationship, settings stores) |
| [React Hook Form](https://react-hook-form.com/) | `7.x` | Performant form state management |
| [Zod](https://zod.dev/) | `3.x` | Schema-based form and data validation |
| [Axios](https://axios-http.com/) | `1.x` | HTTP client with interceptors |

### Styling & UI

| Technology | Version | Purpose |
|:---|:---|:---|
| [TailwindCSS](https://tailwindcss.com/) | `3.4` | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | — | Headless, accessible component primitives (Radix UI based) |
| [Framer Motion](https://www.framer.com/motion/) | `13.x` | Declarative animations and page transitions |
| [Lucide React](https://lucide.dev/) | `0.475` | Consistent icon library |
| `clsx` + `tailwind-merge` | — | Conditional and conflict-free class merging |
| [class-variance-authority](https://cva.style/docs) | `0.7` | Component variant composition |

### Backend & Infrastructure

| Technology | Purpose |
|:---|:---|
| [Supabase](https://supabase.com/) | Auth, PostgreSQL database, Realtime WebSockets, Storage (file uploads), Edge Functions |
| [Vercel](https://vercel.com/) | Production deployment (SPA with fallback rewrite) |
| PostCSS + Autoprefixer | CSS post-processing pipeline |

### PWA Tooling

| Technology | Purpose |
|:---|:---|
| [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) | Service Worker generation, manifest injection, auto-update |
| [Workbox](https://developer.chrome.com/docs/workbox/) | Precaching (`workbox-precaching`), client claim (`workbox-core`) |
| Web Push API | Native push notification delivery |

### Developer Experience

| Tool | Purpose |
|:---|:---|
| ESLint | Static analysis with React Hooks & Refresh plugins |
| Prettier | Opinionated code formatting |
| TypeScript strict mode | Compile-time type safety |
| `@` path alias | Clean import paths via Vite resolve config |

---

## 📦 Feature Modules

### 1. Authentication & User Identity

> **Module path:** `src/services/auth/`, `src/context/Auth*/`, `src/store/authStore.ts`, `src/components/auth/`

| Capability | Detail |
|:---|:---|
| **Email + Password Sign-up/Sign-in** | Standard credential auth via `supabase.auth.signUp()` / `signInWithPassword()` |
| **Google OAuth** | Social login via `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| **Password Reset Flow** | Forgot password → email link → reset page (`/forgot-password`, `/reset-password`) |
| **Session Persistence** | `onAuthStateChange` listener auto-refreshes tokens and syncs `authStore` |
| **Profile Management** | Display name, avatar upload, email — stored in `profiles` table |
| **Route Guards** | `ProtectedRoute` (requires auth) and `GuestRoute` (redirects authenticated users) |

**Zustand Store:** `authStore.ts` — tracks `user`, `session`, `isLoading`, `isAuthenticated`  
**React Context:** `AuthContext.tsx` — provides session & profile to the component tree  
**Zod Schemas:** `loginSchema.ts`, `registerSchema.ts`, `forgotPasswordSchema.ts`, `resetPasswordSchema.ts`

**Custom Hooks:**
- `useAuth` — convenience re-export of auth context
- `useSignIn` — login mutation
- `useSignUp` — registration mutation
- `useSignOut` — sign-out with store cleanup
- `useGoogleSignIn` — OAuth flow trigger
- `useResetPassword` — password reset mutation
- `useSession` — session accessor

---

### 2. Couple Pairing & Relationship Management

> **Module path:** `src/services/couple/`, `src/store/relationshipStore.ts`, `src/components/couple/`, `src/pages/PairPartnerPage.tsx`

| Capability | Detail |
|:---|:---|
| **Email Invite System** | Generate a unique invite code, send to partner's email |
| **Invite Acceptance** | Partner enters code to accept, establishing the couple link |
| **Relationship Lifecycle** | Statuses: `single` → `invited` → `pending` → `partnered` → `paused` → `ended` |
| **Partner Profile Sync** | Realtime subscription keeps partner info up-to-date |
| **Relationship Summary** | Anniversary tracking, relationship name, partner hero card |

**Supabase Tables:** `invitations` (code, sender, receiver, status, expiry), `couples` (relationship_name, anniversary, status)  
**Realtime Channels:** Subscribes to `invitations`, `couples`, and `profiles` table changes  
**Zustand Store:** `relationshipStore.ts` — tracks `couple`, `partner`, `invitations`, relationship state  
**Repository:** `couplesRepository.ts`, `invitationsRepository.ts`

**Custom Hook:** `useCouple` — manages pairing flow, invitation CRUD, partner lookup

**UI Components:**
- `RelationshipSummary` — couple info display
- `PartnerHeroCard` — partner profile widget
- `PendingItemsCard` — pending invites dashboard widget

---

### 3. Live Status & Mood Sharing

> **Module path:** `src/services/status/`, `src/components/status/`, `src/hooks/useStatus.ts`

| Capability | Detail |
|:---|:---|
| **Status Presets** | Quick-select from presets: Working, Driving, Sleeping, Eating, Custom, etc. |
| **Mood Emoji** | Attach an emoji to express current mood |
| **Custom Messages** | Free-text status with personalised message |
| **Auto-Expiry** | Statuses expire after a configurable duration (e.g., 1 hour) |
| **Status History** | View and quickly reapply previous statuses |
| **Partner Live View** | See your partner's current status in real-time on the dashboard |

**Supabase Table:** `statuses` (user_id, couple_id, status_text, emoji, visibility, expires_at)  
**Realtime:** Live partner status updates via Supabase channel subscriptions  
**Repository:** `statusRepository.ts`

**UI Components:**
- `StatusCard` — current status display
- `StatusPicker` — status selection modal
- `StatusHistory` — previous status list

**Utility:** `utils/status.ts` — status formatting helpers

---

### 4. Plans & Shared Calendar

> **Module path:** `src/services/plans/`, `src/components/plans/`, `src/pages/CalendarPage.tsx`, `src/pages/PlansPage.tsx`

| Capability | Detail |
|:---|:---|
| **Shared Calendar** | Both partners view and manage a unified schedule |
| **Event Creation** | Title, description, date/time range, location, colour, priority |
| **Completion Tracking** | Mark plans as completed |
| **Today & Upcoming Widgets** | Dashboard cards showing today's plans and upcoming events |
| **Realtime Sync** | Both partners see schedule changes instantly |

**Supabase Table:** `plans` (couple_id, created_by, title, description, start_at, end_at, location, color, priority, completed)  
**Realtime Hook:** `useRealtimePlans` — live plan updates across devices  
**Repository:** `plansRepository.ts`

**UI Components:**
- `TodayPlansCard` — dashboard widget
- `UpcomingPlansCard` — dashboard widget

---

### 5. Proposals & Date Suggestions

> **Module path:** `src/services/proposals/`, `src/components/proposals/`, `src/pages/ProposalPage.tsx`

| Capability | Detail |
|:---|:---|
| **Create Proposals** | Suggest activities, dates, or milestones to your partner |
| **Accept / Decline** | Partner reviews and responds with optional message |
| **Planned Date** | Optionally attach a target date to the proposal |
| **Status Lifecycle** | `pending` → `accepted` / `declined` |
| **Dashboard Integration** | Pending proposals appear in `PendingItemsCard` |
| **Realtime Updates** | Both partners see proposal changes live |

**Supabase Table:** `proposals` (couple_id, created_by, title, description, planned_date, status, response_message)  
**Realtime Hook:** `useRealtimeProposals` — live proposal state sync  
**Repository:** `proposalRepository.ts`

---

### 6. Memories & Shared Gallery

> **Module path:** `src/services/memories/`, `src/services/storage/`, `src/components/memories/`, `src/pages/GalleryPage.tsx`, `src/pages/TimelinePage.tsx`

| Capability | Detail |
|:---|:---|
| **Photo Upload** | Upload images with automatic compression (client-side) |
| **Gallery View** | Grid-based shared album of couple photos |
| **Timeline View** | Chronological view of memories and milestones |
| **Memory Metadata** | Title, caption, memory date, uploaded-by tracking |
| **Supabase Storage** | Files uploaded to Supabase Storage buckets with public URL generation |
| **Realtime Sync** | Gallery updates live across both devices |

**Supabase Table:** `memories` (couple_id, uploaded_by, title, caption, image_url, memory_date)  
**Supabase Storage:** File bucket for image uploads, public URL generation, deletions  
**Realtime Hook:** `useRealtimeMemories` — live memory feed  
**Repository:** `memoryRepository.ts`  
**Custom Hook:** `useMemories` — CRUD + upload logic  
**Utility:** `utils/imageCompression.ts` — client-side image resizing before upload

**UI Components:**
- `DashboardMemoriesCard` — recent memories widget on dashboard

---

### 7. Notifications System

> **Module path:** `src/services/notifications/`, `src/components/notifications/`, `src/pages/NotificationsPage.tsx`

| Capability | Detail |
|:---|:---|
| **In-App Notification Centre** | Grouped by date (Today, Yesterday, Earlier) |
| **Notification Types** | System, proposals, status updates, memories, plans |
| **Read/Unread State** | Mark individual or all notifications as read |
| **Push Notifications** | Web Push via Service Worker + Supabase Edge Function |
| **Push Subscription** | Registers browser push subscription with VAPID keys |
| **Notification Click Routing** | Clicking a push notification navigates to the relevant page |

**Supabase Table:** `notifications` (recipient_id, sender_id, type, title, body, read)  
**Supabase Edge Function:** `send-push-notification/` — server-side push delivery  
**Database Table:** `push_subscriptions` — stores browser push subscription endpoints  
**Repository:** `notificationRepository.ts`

**Custom Hooks:**
- `useNotifications` — in-app notification queries & mutations
- `usePushNotifications` — Web Push subscription management

**Service Worker Handlers:**
- `push` event — parses payload, shows notification with vibration
- `notificationclick` event — focuses/opens the app to the target URL

**UI Components:**
- `RecentNotificationsWidget` — dashboard notification preview

---

### 8. Settings & Preferences

> **Module path:** `src/services/settings/`, `src/services/preferences/`, `src/store/settingsStore.ts`, `src/components/settings/`, `src/pages/SettingsPage.tsx`

| Capability | Detail |
|:---|:---|
| **Dark / Light Theme** | Toggle with system preference detection, CSS variable switching |
| **Notification Preferences** | Enable/disable push and in-app notification categories |
| **Display Preferences** | UI density, animation toggles |
| **Database Sync** | Settings are persisted to Supabase and synced across devices |
| **Local Fallback** | Settings also cached locally for offline access |

**Supabase Integration:** Settings & preferences tables (Phase 11 migration)  
**Zustand Store:** `settingsStore.ts` — local settings state  
**Repositories:** `settingsRepository.ts`, `preferencesRepository.ts`  
**Provider:** `ThemeProvider.tsx` — applies theme class to document root

**Custom Hook:** `useSettings` — settings CRUD with optimistic updates  
**Custom Hook:** `useTheme` — theme toggling and detection

---

### 9. Activity Feed & Timeline

> **Module path:** `src/services/activity/`, `src/hooks/useRealtimeActivities.ts`

| Capability | Detail |
|:---|:---|
| **Activity Logging** | Tracks couple actions (status changes, plan updates, memory uploads, etc.) |
| **Realtime Feed** | Live activity stream on the dashboard |
| **Activity Types** | Categorised by action type for filtering |

**Supabase Table:** `activities` (Phase 8 migration)  
**Realtime Hook:** `useRealtimeActivities` — live activity stream  
**Repository:** `activitiesRepository.ts`

---

### 10. PWA & Offline Support

> **Module path:** `src/sw.ts`, `vite.config.ts`

| Capability | Detail |
|:---|:---|
| **Installable App** | Full Web App Manifest with icons (192×192, 512×512, maskable) |
| **Offline Shell** | Workbox precaches all build assets (JS, CSS, HTML, images, fonts) |
| **Auto-Update** | `registerType: 'autoUpdate'` refreshes SW transparently |
| **InjectManifest Strategy** | Custom Service Worker (`sw.ts`) with Workbox precache injection |
| **Push Notification Handler** | SW listens for `push` events and displays native notifications |
| **Notification Click** | Routes user to relevant page on notification tap |
| **Portrait Orientation** | Locked to portrait for mobile-first experience |
| **Theme Color** | `#ec4899` (pink) for browser chrome and splash screen |

**Manifest Config:**
- `name`: "Tezā — Couple Companion"
- `short_name`: "Tezā"
- `display`: standalone
- `start_url`: `/`
- `background_color`: `#0f172a` (dark slate)

---

### 11. Landing Page

> **Module path:** `src/pages/HomePage.tsx`

| Capability | Detail |
|:---|:---|
| **Marketing Hero** | Brand-forward hero section with animated gradients |
| **Feature Showcase** | Highlights key app features with visual cards |
| **CTA Buttons** | Sign-up and login calls-to-action |
| **Responsive Design** | Mobile-first with breakpoint-aware layout |
| **Animations** | Framer Motion page and scroll-driven animations |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   React 19 App                  │
├────────────┬────────────┬───────────────────────┤
│   Pages    │ Components │     Layouts           │
│ (Views)    │ (Reusable) │ (Auth/Main/Dashboard) │
├────────────┴────────────┴───────────────────────┤
│              Custom Hooks Layer                  │
│  useAuth, useCouple, useStatus, useMemories,    │
│  useNotifications, useSettings, useRealtime*    │
├─────────────────────────────────────────────────┤
│              State Management                    │
│  Zustand Stores │ TanStack Query │ React Context │
├─────────────────────────────────────────────────┤
│              Service Layer                       │
│  auth, couple, status, plans, proposals,        │
│  memories, notifications, settings, activity    │
├─────────────────────────────────────────────────┤
│           Repository Pattern Layer               │
│  usersRepo, couplesRepo, invitationsRepo,       │
│  plansRepo, proposalRepo, statusRepo,           │
│  memoryRepo, notificationRepo, activitiesRepo,  │
│  settingsRepo, preferencesRepo                  │
├─────────────────────────────────────────────────┤
│            Supabase JS Client                    │
│  Auth │ Database │ Realtime │ Storage │ Edge Fn  │
└─────────────────────────────────────────────────┘
```

### Key Architectural Patterns

| Pattern | Implementation |
|:---|:---|
| **Repository Pattern** | All direct Supabase SDK calls are isolated in `src/services/repositories/` — services and hooks never call `supabase` directly |
| **Custom Hook Abstraction** | 21 custom hooks encapsulate business logic, data fetching, and mutations |
| **Provider Composition** | `QueryProvider` + `ThemeProvider` + `AuthContext` wrap the app root |
| **Nested Layouts** | `MainLayout` (public), `AuthLayout` (guest forms), `DashboardLayout` (protected app shell) |
| **Centralised Routing** | All routes defined in a single `createBrowserRouter` config |
| **Realtime Subscriptions** | Dedicated `useRealtime*` hooks per domain (plans, proposals, memories, activities) |
| **Optimistic Updates** | TanStack Query mutations with `onMutate` for instant UI feedback |
| **Zod Validation** | Form schemas validated at runtime before submission |

---

## 🎨 Design System

### Theme Architecture

The design system uses **HSL CSS custom properties** defined in `src/styles/theme.css`, consumed by TailwindCSS via `hsl(var(--token))` mappings.

**Dark Mode (Default):**
| Token | HSL Value | Hex Approx. |
|:---|:---|:---|
| `--background` | `0 0% 5%` | `#0D0D0D` |
| `--foreground` | `0 0% 98%` | `#FAFAFA` |
| `--primary` | `330 81% 60%` | Pink |
| `--card` | `0 0% 8%` | `#141414` |
| `--muted` | `0 0% 12%` | `#1F1F1F` |
| `--success` | `142 71% 45%` | Green |
| `--warning` | `38 92% 50%` | Amber |
| `--destructive` | `0 84.2% 60.2%` | Red |

**Light Mode:** Toggled via `.light` class on `<html>` with inverted values.

### Typography

| Property | Value |
|:---|:---|
| Font Stack | `Inter`, `Outfit`, `sans-serif` |
| Source | Google Fonts |

### Responsive Breakpoints

| Breakpoint | Width |
|:---|:---|
| `xs` | 320px |
| `sm-mobile` | 375px |
| `mobile` | 425px |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

### Shared UI Components (shadcn/ui)

| Component | Source |
|:---|:---|
| `Button` | `src/components/ui/button.tsx` — CVA-powered with multiple variants |
| `Card` | `src/components/ui/card.tsx` — container, header, content, footer |
| `Input` | `src/components/ui/input.tsx` — styled form input |
| `ButtonSpinner` | `src/components/ui/ButtonSpinner.tsx` — loading state button |
| `FullScreenLoader` | `src/components/ui/FullScreenLoader.tsx` — app loading overlay |
| `SkeletonCard` | `src/components/ui/SkeletonCard.tsx` — content placeholder |

### Animations

| Animation | Usage |
|:---|:---|
| Framer Motion | Page transitions, card reveals, staggered lists |
| `accordion-down/up` | Radix accordion open/close |
| `pulse-subtle` | Soft pulsing effect for live indicators |

### Toast Notifications

| Library | Usage |
|:---|:---|
| [Sonner](https://sonner.emilkowal.dev/) | Toast notification system for success, error, and info feedback |

---

## 🗄 Database Schema

The database runs on **Supabase PostgreSQL** with Row-Level Security (RLS) enforced on all tables.

### Tables

| Table | Purpose | Key Columns |
|:---|:---|:---|
| `profiles` | User identity & partner linking | `id`, `email`, `display_name`, `avatar_url`, `relationship_status`, `partner_id` |
| `couples` | Couple entity & metadata | `id`, `relationship_name`, `anniversary`, `status`, `created_by` |
| `invitations` | Partner invite tracking | `invite_code`, `sender_id`, `receiver_id`, `couple_id`, `status`, `expires_at` |
| `statuses` | Live status & mood | `user_id`, `couple_id`, `status_text`, `emoji`, `visibility`, `expires_at` |
| `plans` | Shared calendar events | `couple_id`, `created_by`, `title`, `start_at`, `end_at`, `location`, `priority` |
| `proposals` | Date/activity suggestions | `couple_id`, `created_by`, `title`, `planned_date`, `status`, `response_message` |
| `memories` | Shared photo gallery | `couple_id`, `uploaded_by`, `title`, `caption`, `image_url`, `memory_date` |
| `notifications` | In-app alerts | `recipient_id`, `sender_id`, `type`, `title`, `body`, `read` |
| `push_subscriptions` | Browser push endpoints | Subscription data for Web Push delivery |
| `activities` | Couple activity log | Action tracking for timeline feed |

### Migration History

| Migration | Phase | Scope |
|:---|:---|:---|
| `phase4_schema` | 4 | Core schema (profiles, couples, invitations) |
| `phase5_pairing` | 5 | Partner pairing & invite flows |
| `phase7_plans` | 7 | Plans & calendar table |
| `phase8_activities` | 8 | Activity logging table |
| `phase9_proposals` | 9 | Proposal system table |
| `phase10_memories` | 10 | Memories & gallery table |
| `create_push_subscriptions` | — | Push notification subscriptions |
| `phase11_settings` | 11 | Settings & preferences tables |
| `phase12_audit_hardening` | 12 | Security: RLS repair, RPC sanitization, search_path isolation, storage policies |

### Edge Functions

| Function | Purpose |
|:---|:---|
| `send-push-notification` | Server-side Web Push delivery to subscribed browsers |

---

## 🔗 Supabase Integration Map

| Supabase Feature | Usage in Tezā |
|:---|:---|
| **Auth** | Email/password, Google OAuth, session management, password reset |
| **Database (PostgreSQL)** | All application data via typed repositories |
| **Row-Level Security (RLS)** | Enforced on every table — users can only access their own couple's data |
| **Realtime** | WebSocket channels for statuses, plans, proposals, memories, activities, invitations |
| **Storage** | Image upload buckets for memories & avatars with public URL generation |
| **Edge Functions** | Push notification delivery (`send-push-notification`) |
| **Database Triggers** | `handle_new_user()` auto-creates profile on sign-up |
| **RPC Functions** | Secure server-side operations with parameter sanitization |

---

## 🗺 Route Map

### Public Routes

| Path | Page | Layout |
|:---|:---|:---|
| `/` | `HomePage` | `MainLayout` |
| `*` | `NotFoundPage` | `MainLayout` |

### Guest-Only Routes (redirects if authenticated)

| Path | Page | Layout |
|:---|:---|:---|
| `/login` | `LoginPage` | `AuthLayout` |
| `/register` | `RegisterPage` | `AuthLayout` |
| `/forgot-password` | `ForgotPasswordPage` | `AuthLayout` |
| `/reset-password` | `ResetPasswordPage` | `AuthLayout` |

### Protected Routes (requires authentication)

| Path | Page | Layout |
|:---|:---|:---|
| `/dashboard` | `DashboardPage` | `DashboardLayout` |
| `/pair` | `PairPartnerPage` | `DashboardLayout` |
| `/plans` | `PlansPage` | `DashboardLayout` |
| `/calendar` | `PlansPage` | `DashboardLayout` |
| `/proposal` | `ProposalPage` | `DashboardLayout` |
| `/memories` | `GalleryPage` | `DashboardLayout` |
| `/gallery` | `GalleryPage` | `DashboardLayout` |
| `/timeline` | `TimelinePage` | `DashboardLayout` |
| `/profile` | `ProfilePage` | `DashboardLayout` |
| `/settings` | `SettingsPage` | `DashboardLayout` |
| `/notifications` | `NotificationsPage` | `DashboardLayout` |

---

## 📁 Source Directory Structure

```
src/
├── components/
│   ├── auth/            # ProtectedRoute, GuestRoute, login/register forms
│   ├── common/          # ErrorBoundary, shared widgets
│   ├── couple/          # RelationshipSummary, PartnerHeroCard
│   ├── dashboard/       # Dashboard-specific cards and widgets
│   ├── layout/          # Navigation header, mobile bottom nav
│   ├── memories/        # Gallery grid, memory cards
│   ├── notifications/   # Notification list, recent widget
│   ├── plans/           # Plan cards, calendar widgets
│   ├── proposals/       # Proposal cards, response UI
│   ├── settings/        # Settings forms, theme toggle
│   ├── status/          # StatusCard, StatusPicker, StatusHistory
│   └── ui/              # shadcn primitives (Button, Card, Input, loaders)
├── constants/           # Routes, query keys, colors, storage keys
├── context/             # AuthContext (session + profile provider)
├── hooks/               # 21 custom hooks (auth, data, realtime, UI)
├── layouts/             # AuthLayout, MainLayout, DashboardLayout
├── lib/                 # QueryClient config, utility re-exports
├── pages/               # 16 page-level view components
├── providers/           # QueryProvider, ThemeProvider
├── routes/              # Centralised React Router configuration
├── schemas/             # Zod validation schemas (login, register, password)
├── services/
│   ├── activity/        # Activity logging service
│   ├── api/             # Axios client instance & interceptors
│   ├── auth/            # Authentication service
│   ├── couple/          # Couple pairing service
│   ├── errors/          # Error handling utilities
│   ├── memories/        # Memory CRUD service
│   ├── notifications/   # Notification service
│   ├── plans/           # Plans service
│   ├── preferences/     # User preferences service
│   ├── proposals/       # Proposal service
│   ├── realtime/        # Supabase Realtime channel management
│   ├── repositories/    # 12 repository modules (data access layer)
│   ├── settings/        # Settings service
│   ├── status/          # Status service
│   ├── storage/         # Supabase Storage wrapper (upload, delete, URLs)
│   └── supabase/        # Supabase client initialisation
├── store/               # Zustand stores (auth, app, relationship, settings)
├── styles/              # HSL theme CSS variables (dark + light)
├── types/               # TypeScript interfaces & database types
├── utils/               # Helpers (cn, formatDate, imageCompression, storage)
├── sw.ts                # Custom Service Worker (Workbox + Push)
├── App.tsx              # Root component with provider composition
└── main.tsx             # Application entry point
```

---

## 🔒 Security

| Measure | Detail |
|:---|:---|
| **Row-Level Security** | All Supabase tables enforce RLS — users can only access data belonging to their couple |
| **RPC Parameter Sanitization** | Server-side functions validate and sanitise all inputs (Phase 12) |
| **Search Path Isolation** | PostgreSQL `search_path` hardened to prevent schema injection |
| **Storage Policies** | Supabase Storage buckets enforce access control policies |
| **Environment Variables** | Supabase URL and anon key stored in `.env`, never committed |
| **Auth Token Refresh** | Automatic token refresh via `onAuthStateChange` listener |

---

> **Last updated:** August 2026  
> **See also:** [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) · [`database_erd.md`](./database_erd.md)
