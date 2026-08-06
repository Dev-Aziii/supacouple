# 🚀 SupaCouple Deployment & Google OAuth Integration Guide

This guide provides step-by-step instructions to deploy your **SupaCouple** web application on **Vercel** and connect it to your **Supabase** backend, including complete **Google OAuth 2.0** configuration.

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have access to:
- [x] **GitHub Repository**: Pushed code with latest changes.
- [x] **Vercel Account**: [vercel.com](https://vercel.com)
- [x] **Supabase Project**: [supabase.com](https://supabase.com)
- [x] **Google Cloud Console Account**: [console.cloud.google.com](https://console.cloud.google.com)

---

## 🔑 Phase 1: Google Cloud Console Setup (OAuth 2.0)

To enable Google Sign-In, you need to create OAuth 2.0 credentials in the Google Cloud Console.

### Step 1.1: Create/Select a GCP Project
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click the project dropdown near the top logo and click **New Project**.
3. Name your project (e.g. `SupaCouple App`) and click **Create**.

### Step 1.2: Configure OAuth Consent Screen
1. Navigation Menu ➔ **APIs & Services** ➔ **OAuth consent screen**.
2. Select User Type:
   - Choose **External** (unless you are using Google Workspace internal users).
3. Click **Create**.
4. Fill in **App Information**:
   - **App Name**: `SupaCouple`
   - **User Support Email**: Select your email address.
   - **Developer Contact Information**: Enter your email address.
5. Click **Save and Continue**.
6. On the **Scopes** page:
   - Click **Add or Remove Scopes**.
   - Select `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
   - Click **Update** then **Save and Continue**.
7. On **Test Users** (if in Testing mode):
   - Add your test Google email addresses (or publish the app to Production mode).
8. Click **Back to Dashboard**.

### Step 1.3: Create Credentials (OAuth Client ID)
1. Go to **APIs & Services** ➔ **Credentials**.
2. Click **+ Create Credentials** ➔ **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `SupaCouple Supabase Auth`.
5. **Authorized JavaScript origins**:
   ```text
   https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co
   ```
   *(Example: `https://xyzprojectref.supabase.co`)*
6. **Authorized redirect URIs**:
   ```text
   https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
   > 💡 *Note: You can find your Supabase Project Reference in Supabase Project Settings ➔ General ➔ Reference ID.*

7. Click **Create**.
8. Copy and securely save:
   - **Client ID** (e.g. `1234567890-xxx.apps.googleusercontent.com`)
   - **Client Secret** (e.g. `GOCSPX-xxx`)

---

## ⚡ Phase 2: Supabase Backend & Auth Configuration

### Step 2.1: Enable Google Auth Provider
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your **SupaCouple** project.
3. In the sidebar, go to **Authentication** ➔ **Providers**.
4. Scroll down to **Google** and click to open settings.
5. Toggle **Enable Google provider** to `ON`.
6. Paste your copied credentials:
   - **Client ID**: `<Your-Google-Client-ID>`
   - **Client Secret**: `<Your-Google-Client-Secret>`
7. Click **Save**.

### Step 2.2: Configure Site URL & Redirect URLs
1. In Supabase, go to **Authentication** ➔ **URL Configuration**.
2. Set **Site URL**:
   ```text
   https://<YOUR-VERCEL-APP-DOMAIN>.vercel.app
   ```
   *(Or your custom domain like `https://supacouple.app`)*
3. In **Redirect URLs**, add the following entries:
   - `http://localhost:5173/**` (For local Vite development)
   - `http://localhost:3000/**`
   - `https://<YOUR-VERCEL-APP-DOMAIN>.vercel.app/**`
   - `https://*.vercel.app/**` (Allows preview deployment branches)
4. Click **Save**.

---

## 🔺 Phase 3: Vercel Frontend Deployment

### Step 3.1: Connect Repository to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository (`Dev-Aziii/supacouple`).

### Step 3.2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3.3: Configure Environment Variables
In the **Environment Variables** section, add the following variables:

| Variable Key | Description | Value Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase API URL | `https://<PROJECT-REF>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOiJIUzI1NiIsInR5c...` |

> 📍 *Find these in Supabase Dashboard ➔ Project Settings ➔ API.*

### Step 3.4: Deploy
1. Click **Deploy**.
2. Wait ~1 minute for Vercel to build and publish your app.
3. Once completed, Vercel will provide your production URL (e.g. `https://supacouple.vercel.app`).

---

## 🗄️ Phase 4: Database Migration & RLS Check

Ensure your Supabase PostgreSQL database tables and RLS policies are up to date:

1. Go to Supabase Dashboard ➔ **SQL Editor**.
2. Check existing tables: `profiles`, `couples`, `relationship_memories`, `proposals`, `couple_statuses`, `notifications`.
3. If setting up a fresh database, execute the migration scripts located in your project repository under `supabase/migrations/`.
4. Confirm Row Level Security (RLS) policies are active on `profiles`:
   - `USERS CAN VIEW OWN PROFILE`
   - `USERS CAN UPDATE OWN PROFILE`
   - `USERS CAN INSERT OWN PROFILE`

---

## ✅ Phase 5: Post-Deployment Verification Checklist

Once deployed, perform the following verification steps:

1. **Email/Password Login & Registration**:
   - Navigate to `https://<YOUR-APP>.vercel.app/login`.
   - Test creating a user account and logging in.
2. **Google OAuth Sign In**:
   - Click **Continue with Google** on the login or register page.
   - Confirm Google OAuth popup/redirect appears.
   - Select your Google account.
   - Verify redirection back to the app (`/dashboard`) and that your name & avatar sync to your profile.
3. **Session Persistence & Logout**:
   - Refresh the page and confirm you remain logged in.
   - Click **Sign Out** and verify redirection back to `/login`.

---

## 🛠️ Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `redirect_uri_mismatch` (Google Error) | Redirect URI in Google Cloud doesn't match Supabase callback | Ensure `https://<REF>.supabase.co/auth/v1/callback` is added under Google OAuth Client Credentials. |
| `invalid_claim` / CORS error | Missing origin in Supabase URL config | Add your Vercel URL to Supabase Auth ➔ URL Configuration ➔ Redirect URLs. |
| Blank white page on Vercel | Single-Page Application (SPA) routing issue | Add `vercel.json` with rewrite rules if routing breaks on deep URLs (Vite handles SPA routing natively). |
| Missing environment variables | `VITE_` prefix omitted | Ensure env vars in Vercel start with `VITE_` so Vite bundles them into client code. |

---

*🎉 Congratulations! Your SupaCouple application is now fully deployed on Vercel with Google OAuth and Supabase backend integration.*
