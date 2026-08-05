# 💖 SupaCouple — Progressive Web Application for Couples

**SupaCouple** is a modern, responsive Progressive Web Application (PWA) designed for couples to share daily status, schedule dates, propose spontaneous trips, and cherish shared memories.

Built on top of a 100% free-tier architecture utilizing **React 19**, **Vite**, **TypeScript**, **TailwindCSS**, **shadcn/ui**, **React Router v7**, **TanStack Query**, **Zustand**, and **Supabase**.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Data Fetching & Caching**: [TanStack Query v5](https://tanstack.com/query)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Styling & UI
- **CSS Framework**: [TailwindCSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `clsx` + `tailwind-merge`

### PWA & Offline Support
- **Plugin**: [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/)
- Service Worker registration, Offline app shell caching, Web App Manifest.

### Backend (Phase 2 Ready)
- **Database & Auth**: [Supabase](https://supabase.com/)

---

## 📁 Folder Structure

```
src/
├── assets/         # Static images, vectors, and icons
├── components/     # Reusable UI components
│   ├── common/     # App logo, shared widgets
│   ├── layout/     # Navigation header, mobile bottom nav
│   └── ui/         # shadcn UI components (Button, Card, Input)
├── config/         # App level configurations
├── constants/      # Routes map, design tokens, storage keys
├── context/        # React contexts
├── features/       # Feature modules (auth, dashboard, plans, proposals, profile)
├── hooks/          # Custom hooks (useLocalStorage, etc.)
├── layouts/        # Layout wrappers (MainLayout, AuthLayout, DashboardLayout)
├── lib/            # Shared libraries (QueryClient, utils)
├── pages/          # Application views (Home, Login, Register, Dashboard, Plans, etc.)
├── providers/      # Global providers (QueryProvider, ThemeProvider)
├── routes/         # Centralized React Router configuration
├── schemas/        # Zod validation schemas
├── services/       # API clients and Supabase SDK integration
│   ├── api/        # Axios client instance & interceptors
│   └── supabase/   # Supabase client configuration
├── store/          # Zustand state stores (appStore, authStore)
├── styles/         # Global styles & HSL theme CSS variables
├── types/          # TypeScript interface definitions
├── utils/          # Helper functions (cn, formatDate, storage)
├── App.tsx         # Root component with provider wrapping
└── main.tsx        # Application entrypoint
```

---

## 🛠️ Installation & Setup

1. **Clone the repository & install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Supabase URL & Anon Key (ready for Phase 2).

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Vite development server |
| `npm run build` | Compiles TypeScript and builds production assets |
| `npm run typecheck` | Validates TypeScript types across the codebase |
| `npm run lint` | Runs ESLint checks |
| `npm run format` | Formats code with Prettier |
| `npm run preview` | Serves local production build preview |

---

## ⚡ Connecting to Supabase (Phase 2 Roadmap)

If you have already configured the **Supabase MCP server** in your environment, follow these steps to connect your project:

### Option A: Using Supabase MCP Server
1. Run `mcp_supabase_list_projects` to view existing projects or `mcp_supabase_create_project` to create a new free tier project.
2. Retrieve your project URL and public anon key using `mcp_supabase_get_publishable_keys`.
3. Add the keys to `.env`:
   ```env
   VITE_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
   VITE_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
   ```
4. Install the Supabase JS SDK:
   ```bash
   npm install @supabase/supabase-js
   ```

### Option B: Via Supabase Web Dashboard
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **New Project**, select your organization, set a project name (e.g. `supa-couple`), database password, and region.
3. Under **Project Settings -> API**, copy `Project URL` and `anon public` API key into your `.env` file.

---

## 🔮 Future Phases Roadmap

- [x] **Phase 1**: Base Architecture, Design System, PWA Setup, React Router, QueryClient, Zustand, Types.
- [ ] **Phase 2**: Supabase Auth (Email + OTP / Magic Link), User Profiles & Partner Pairing via QR/Code.
- [ ] **Phase 3**: Shared Status Updates (Mood, Location, Activity) with Real-Time WebSockets (`supabase_realtime`).
- [ ] **Phase 4**: Date & Trip Planning Module (Interactive Calendar, Bucket Lists).
- [ ] **Phase 5**: Spontaneous Proposals & Push Notifications (`vite-plugin-pwa` web push).
- [ ] **Phase 6**: Shared Memories Gallery & Private Chat.

---

## 🌐 Deployment Targets

Compatible with both **Vercel** and **Netlify**:

- **Vercel**: `npx vercel`
- **Netlify**: `npx netlify deploy`
