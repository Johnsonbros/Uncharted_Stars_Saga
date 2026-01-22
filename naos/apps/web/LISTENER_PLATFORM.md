# Listener Platform Documentation

> **Last Updated:** 2026-01-22
> **Status:** Phase 2 - Development Structure Complete

This document describes the Listener Platform architecture, structure, and development guidelines for the public-facing components of the Uncharted Stars Saga NAOS system.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Pages](#pages)
5. [Components](#components)
6. [API Routes](#api-routes)
7. [Database Schema](#database-schema)
8. [Authentication](#authentication)
9. [Development Guidelines](#development-guidelines)
10. [Next Steps](#next-steps)

---

## Overview

The Listener Platform is the **public-facing interface** for the Uncharted Stars Saga audiobook universe. It provides:

- **Marketing & Discovery**: Landing page with audio trailer and value proposition
- **Membership Management**: Founders ($49 lifetime) checkout and signup flow
- **Content Library**: Browse and access available audiobook chapters
- **Audio Player**: Premium listening experience with playback tracking
- **Account Settings**: Manage preferences, notifications, and membership

**Key Principles:**
- Audio-first experience (text is supporting, not primary)
- Clean, distraction-free interface (no ads, no tracking beyond essentials)
- Premium listening experience optimized for long-form content
- Direct creator-to-listener relationship

**Separation of Concerns:**
The Listener Platform is strictly separated from the Creator Studio (`/studio/*` routes). They:
- Use different navigation patterns
- Target different audiences (listeners vs. creator)
- Have different data access patterns (read-only vs. read-write)
- Should never share UI components or authentication flows

---

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Custom CSS with CSS variables (see `app/globals.css`)
- **Database**: PostgreSQL via Drizzle ORM
- **Audio Storage**: Replit Object Storage (Phase 3)
- **Authentication**: Email-based (Replit Auth or Supabase - TBD)
- **Payments**: Stripe Checkout

### Data Flow

```
User Browser
    ↓
Next.js Pages (React Server Components)
    ↓
API Routes (Backend Logic)
    ↓
PostgreSQL (Listener Database)
    ↓
Stripe Webhooks (Payment Events)
```

For audio playback:
```
User Browser → API Route → Generate Signed URL → Replit Object Storage → Stream Audio
```

---

## Directory Structure

```
naos/apps/web/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page (marketing)
│   ├── signup/                   # Email signup flow
│   │   ├── page.tsx
│   │   └── SignupForm.tsx
│   ├── founders/                 # Founders checkout
│   │   ├── page.tsx
│   │   └── FoundersCheckoutForm.tsx
│   ├── library/                  # Content library (authenticated)
│   │   └── page.tsx
│   ├── player/                   # Audio player (authenticated)
│   │   └── page.tsx
│   ├── account/                  # Account settings (authenticated)
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   ├── onboarding/           # User registration
│   │   ├── checkout/             # Stripe checkout
│   │   ├── webhooks/stripe/      # Stripe webhook handler
│   │   ├── entitlements/         # Entitlement queries
│   │   └── playback/position/    # Playback position tracking
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # Shared React components
│   ├── ListenerNav.tsx           # Navigation bar for listener pages
│   ├── ListenerFooter.tsx        # Footer component
│   └── AudioPlayer.tsx           # Advanced audio player component
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication utilities
│   ├── listenerEntitlements.ts  # Entitlement verification
│   ├── listenerPlaybackPositions.ts # Playback tracking
│   ├── db.ts                     # Database connection
│   └── stripe.ts                 # Stripe client
├── drizzle/                      # Database schema and migrations
│   ├── schema.ts                 # Database schema definitions
│   └── migrations/               # Migration files
└── LISTENER_PLATFORM.md          # This file
```

---

## Pages

### `/` - Landing Page

**Purpose:** Marketing and discovery
**Status:** ✅ Complete
**Authentication:** Not required

Features:
- Hero section with value proposition
- Audio trailer embed
- Listener journey steps
- Feature highlights
- Founders membership CTA
- Link to Creator Studio

**File:** `app/page.tsx`

---

### `/signup` - Email Signup

**Purpose:** Email capture for potential listeners
**Status:** ✅ Complete
**Authentication:** Not required

Features:
- Email input form
- Validation
- Registration API call
- Redirect to checkout or library

**File:** `app/signup/page.tsx`

---

### `/founders` - Founders Checkout

**Purpose:** Stripe checkout for $49 lifetime membership
**Status:** ✅ Complete
**Authentication:** Recommended (email required)

Features:
- Pricing display
- Benefits summary
- Stripe Checkout integration
- Webhook processing for payment confirmation

**Files:**
- `app/founders/page.tsx`
- `app/api/checkout/start/route.ts`
- `app/api/webhooks/stripe/route.ts`

---

### `/library` - Content Library

**Purpose:** Browse available audiobook chapters
**Status:** ✅ Complete
**Authentication:** Required

Features:
- List all available chapters
- Show progress for in-progress chapters
- Filter by series/book (future)
- Resume playback button
- Coming soon indicators

**File:** `app/library/page.tsx`

**TODO:**
- Connect to actual database queries
- Implement authentication check
- Add chapter filtering/sorting
- Display user-specific progress

---

### `/player` - Audio Player

**Purpose:** Listen to audiobook chapters
**Status:** ✅ Complete (UI only)
**Authentication:** Required

Features:
- Full-featured audio player
- Progress tracking
- Speed control (0.75x - 2.0x)
- Skip forward/backward (15s)
- Keyboard shortcuts
- Chapter metadata display
- Auto-save playback position

**File:** `app/player/page.tsx`

**TODO:**
- Integrate signed URL generation for audio
- Connect to playback position API
- Add keyboard shortcut handlers
- Implement auto-resume functionality

---

### `/account` - Account Settings

**Purpose:** Manage membership and preferences
**Status:** ✅ Complete
**Authentication:** Required

Features:
- Membership details display
- Notification preferences
- Playback preferences
- Data export request
- Clear playback history

**File:** `app/account/page.tsx`

**TODO:**
- Connect to actual user data
- Implement preference persistence
- Add data export functionality
- Add notification management

---

## Components

### `ListenerNav`

Navigation component for listener-facing pages.

**Props:**
- `currentPath?: string` - Highlights the active page

**Usage:**
```tsx
import ListenerNav from "@/components/ListenerNav";

export default function MyPage() {
  return (
    <>
      <ListenerNav currentPath="/library" />
      {/* Page content */}
    </>
  );
}
```

---

### `ListenerFooter`

Footer component with branding and contact info.

**Usage:**
```tsx
import ListenerFooter from "@/components/ListenerFooter";

export default function MyPage() {
  return (
    <>
      {/* Page content */}
      <ListenerFooter />
    </>
  );
}
```

---

### `AudioPlayer`

Advanced audio player with custom controls.

**Props:**
- `audioUrl?: string` - URL to audio file (signed URL from object storage)
- `chapterId: string` - Chapter identifier
- `initialPosition?: number` - Starting position in seconds
- `duration: number` - Total duration in seconds
- `onPositionUpdate?: (position: number) => void` - Callback for position updates

**Features:**
- Play/pause toggle
- Skip forward/backward (15s)
- Playback speed control
- Progress bar with seek
- Keyboard shortcuts
- Auto-save position every 5 seconds

**Usage:**
```tsx
import AudioPlayer from "@/components/AudioPlayer";

export default function PlayerPage() {
  const handlePositionUpdate = async (position: number) => {
    await fetch("/api/playback/position", {
      method: "POST",
      body: JSON.stringify({ chapterId, position })
    });
  };

  return (
    <AudioPlayer
      audioUrl="https://storage.example.com/audio/chapter-1.mp3"
      chapterId="infinitys-reach-prologue"
      initialPosition={1122}
      duration={2760}
      onPositionUpdate={handlePositionUpdate}
    />
  );
}
```

---

## API Routes

### `POST /api/onboarding/register`

Register a new listener account.

**Request:**
```json
{
  "email": "listener@example.com"
}
```

**Response:**
```json
{
  "listenerId": "uuid",
  "email": "listener@example.com",
  "status": "pending"
}
```

**File:** `app/api/onboarding/register/route.ts`

---

### `POST /api/checkout/start`

Start Stripe checkout session.

**Request:**
```json
{
  "email": "listener@example.com",
  "tier": "founders"
}
```

**Response:**
```json
{
  "sessionId": "stripe-session-id",
  "url": "https://checkout.stripe.com/..."
}
```

**File:** `app/api/checkout/start/route.ts`

---

### `POST /api/webhooks/stripe`

Handle Stripe webhook events (payment confirmation).

**Headers:**
- `stripe-signature` - Stripe webhook signature

**Events Handled:**
- `checkout.session.completed`
- `payment_intent.succeeded`

**File:** `app/api/webhooks/stripe/route.ts`

---

### `GET /api/entitlements?email=<email>`

Query listener entitlements.

**Response:**
```json
{
  "entitlements": [
    {
      "id": "uuid",
      "status": "active",
      "productId": "founders-lifetime",
      "accessStart": "2026-01-22T00:00:00Z",
      "accessEnd": null
    }
  ]
}
```

**File:** `app/api/entitlements/route.ts`

---

### `POST /api/playback/position`

Update playback position for a chapter.

**Request:**
```json
{
  "listenerId": "uuid",
  "assetId": "infinitys-reach-prologue",
  "positionSeconds": 1122
}
```

**Response:**
```json
{
  "success": true
}
```

**File:** `app/api/playback/position/route.ts`

---

## Database Schema

### Listener Tables

The following tables are used by the Listener Platform:

#### `listeners`

Stores listener account information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | Unique email address |
| `status` | ENUM | `pending`, `active`, `deleted` |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

---

#### `entitlements`

Tracks listener access rights.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `listener_id` | UUID | Foreign key → `listeners.id` |
| `product_id` | TEXT | Product identifier (e.g., "founders-lifetime") |
| `access_start` | TIMESTAMP | Access start date |
| `access_end` | TIMESTAMP | Access end date (NULL for lifetime) |
| `status` | ENUM | `active`, `expired`, `revoked` |
| `stripe_payment_intent_id` | TEXT | Stripe payment reference |
| `created_at` | TIMESTAMP | Entitlement creation time |

---

#### `playback_positions`

Tracks playback progress for each listener.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `listener_id` | UUID | Foreign key → `listeners.id` |
| `asset_id` | TEXT | Chapter/audio identifier |
| `position_seconds` | INTEGER | Current position in seconds |
| `updated_at` | TIMESTAMP | Last update time |

**Unique constraint:** `(listener_id, asset_id)`

---

**See also:**
- [drizzle/schema.ts](./drizzle/schema.ts) for complete schema definitions
- [docs/listener_schema_erd.md](../../docs/listener_schema_erd.md) for ERD diagram

---

## Authentication

### Current Status

**Status:** 🚧 Placeholder implementation

The authentication system is currently stubbed out with placeholder utilities in `lib/auth.ts`. Full implementation is planned for Phase 3.

### Planned Implementation

**Options:**
1. **Replit Auth** (recommended for Replit hosting)
2. **Supabase Auth** (if more flexibility needed)

**Flow:**
1. User signs up with email
2. Email verification link sent
3. User clicks link to verify
4. Session cookie set (HTTP-only, secure)
5. Session validated on each request

**Protected Routes:**
- `/library`
- `/player`
- `/account`

### Auth Utilities

**File:** `lib/auth.ts`

**Available Functions:**
- `getCurrentSession()` - Get current listener session
- `hasChapterAccess(chapterId, session)` - Check chapter access
- `verifyListenerEmail(email)` - Verify email exists
- `createSession(listenerId, email)` - Create new session
- `destroySession()` - Logout
- `requireAuth()` - Middleware helper for protected routes

**Usage in API Routes:**
```typescript
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Proceed with authenticated request
}
```

---

## Development Guidelines

### Adding New Pages

1. Create page in `app/<route>/page.tsx`
2. Use `ListenerNav` and `ListenerFooter` components
3. Follow existing CSS class patterns from `globals.css`
4. Add authentication check if needed
5. Connect to API routes for data

**Example:**
```tsx
import ListenerNav from "@/components/ListenerNav";
import ListenerFooter from "@/components/ListenerFooter";

export default function NewPage() {
  return (
    <div className="studio-shell">
      <ListenerNav currentPath="/new-page" />

      <div className="studio-main">
        <div className="studio-section">
          <h1 className="section-title">New Page</h1>
          {/* Content */}
        </div>
      </div>

      <ListenerFooter />
    </div>
  );
}
```

---

### Adding API Routes

1. Create route in `app/api/<endpoint>/route.ts`
2. Export HTTP method handlers (`GET`, `POST`, etc.)
3. Validate request data with Zod
4. Use database utilities from `lib/`
5. Return JSON responses

**Example:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
```

---

### Styling Guidelines

**Use existing CSS classes from `globals.css`:**

- `.nav` - Navigation bar
- `.button` / `.button.secondary` - Buttons
- `.studio-shell` - Page wrapper
- `.studio-main` - Main content area
- `.studio-section` - Content section
- `.studio-card` - Card container
- `.section-title` / `.section-copy` - Section headers
- `.muted` - Muted text color

**CSS Variables:**
- `--bg` - Background color
- `--text` - Text color
- `--muted` - Muted text color
- `--accent` - Accent color (purple)
- `--border` - Border color

**Do not:**
- Add inline styles unless necessary
- Create new CSS files (use globals.css)
- Use Tailwind classes (not configured)

---

### Database Queries

Use Drizzle ORM for all database queries.

**Example:**
```typescript
import { db } from "@/lib/db";
import { listeners, entitlements } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// Query listener by email
const listener = await db
  .select()
  .from(listeners)
  .where(eq(listeners.email, email))
  .limit(1);

// Query entitlements for listener
const userEntitlements = await db
  .select()
  .from(entitlements)
  .where(eq(entitlements.listenerId, listenerId));
```

---

## Next Steps

### Phase 2: Audio Engine (Current)

- [ ] Integrate audio storage with signed URLs
- [ ] Connect player to actual audio files
- [ ] Implement playback position auto-save
- [ ] Add keyboard shortcut handlers

### Phase 3: Integration & Polish

- [ ] Implement full authentication (Replit Auth or Supabase)
- [ ] Connect all pages to real data sources
- [ ] Add loading states and error handling
- [ ] Implement notification system
- [ ] Add data export functionality
- [ ] Security audit (OWASP Top 10)
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG AA)

### Phase 4: Launch Preparation

- [ ] Beta testing with real users
- [ ] Stripe payment flow testing
- [ ] Audio streaming performance testing
- [ ] Mobile responsiveness testing
- [ ] Documentation for users
- [ ] Support system setup

---

## Related Documentation

- [README.md](../../README.md) - Project overview
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture
- [CLAUDE.md](../../CLAUDE.md) - AI assistant guidelines
- [docs/listener_schema_erd.md](../../docs/listener_schema_erd.md) - Database ERD
- [docs/marketing_onboarding.md](../../docs/marketing_onboarding.md) - Marketing funnel
- [docs/payments_entitlements.md](../../docs/payments_entitlements.md) - Payment flows

---

**Questions or issues?**

Refer to:
- [CLAUDE.md](../../CLAUDE.md) for development guidelines
- [SYSTEM_TODO.md](../../SYSTEM_TODO.md) for task tracking
- Email: hello@unchartedstars.ai for support

---

**Last updated:** 2026-01-22
