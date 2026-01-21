# UI Documentation (MVP)

## Purpose
This document consolidates the UI guidance and MVP requirements currently specified in the repository and organizes it into a single reference for UI systems, subsystems, navigation, and page-level scope. It is derived from the existing architecture and UX flow documentation and is intended to be expanded as implementation progresses.

## Source References
- **ARCHITECTURE.md** (Listener Platform + website structure + MVP page list).
- **docs/player_ux_flows.md** (library → player → resume flow and player behavior).

## Core UX/Design Intent (from current docs)
- **Listening-first experience** with a premium, distraction-free audiobook experience for paid listeners.
- **Public marketing/discovery** pages that funnel into Founders membership.
- **Authenticated experience** centered on library access and chapter playback with resume.

## MVP Sitemap (Required Pages)
Derived from the documented website structure and MVP page list.

### Public Pages
- `/` — Landing page (audio trailer).
- `/story` — Story overview.
- `/about` — About creator.
- `/founders` — Founders checkout.
- `/login` — Email authentication.

### Authenticated Pages
- `/library` — Library of available chapters.
- `/listen/:chapterId` — Chapter player.
- `/account` — Account details and Founders status.

## UI Systems & Subsystems

### 1) Marketing & Discovery (Public)
**Goal:** Provide compelling, audio-first marketing entry points and convert to Founders membership.

**Subsystems:**
- Landing page with audio trailer.
- Story overview page (story pitch, world overview).
- About page (creator bio/mission).
- Founders checkout flow.
- Login page (email-first auth).

**Navigation:**
- Primary nav links: Home, Story, About, Founders.
- Auth-related entry: Login.

### 2) Authentication & Entitlement
**Goal:** Gate access to premium listening features and manage Founders status.

**Subsystems:**
- Email-first login page (`/login`).
- Founders purchase flow (`/founders`) and entitlement checks for authenticated routes.

### 3) Library & Playback (Authenticated)
**Goal:** Provide uninterrupted chapter playback with resume support.

**Subsystems:**
- Library page listing available chapters (`/library`).
- Chapter player with resume (`/listen/:chapterId`).
- Mini player behavior (collapsed view with title, play/pause, progress).
- Resume logic (save playback position and show “Resume” badge).

**Playback Edge Cases:**
- If signed URL expires mid-playback, refresh token and resume.
- If entitlement expires, block playback with upgrade prompt.

### 4) Account
**Goal:** Display user details and Founders status.

**Subsystems:**
- Account page (`/account`) with Founders status.

## Page-Level Functional Requirements

### Landing Page (`/`)
- Audio trailer playback entry point.
- Primary CTA to Founders checkout.
- Secondary navigation to Story/About.

### Story Overview (`/story`)
- Story summary and positioning.
- CTA to Founders checkout.

### About (`/about`)
- Creator bio/mission.
- CTA to Founders checkout.

### Founders Checkout (`/founders`)
- Single price, lifetime access purchase.
- Stripe Checkout (one-time payment).

### Login (`/login`)
- Email-first authentication.

### Library (`/library`)
- List of chapters.
- “Resume” badge when playback position exists.
- Entry to chapter player.

### Chapter Player (`/listen/:chapterId`)
- Full player view with chapter metadata.
- Play/pause, progress updates, resume from last checkpoint.
- Mini player collapsed view.

### Account (`/account`)
- Display Founders status.

## Navigation & Routing Notes
- Public routes accessible without auth.
- Authenticated routes require valid session + entitlement.
- Signed URL access flow for audio streaming handled by API routes.

## MVP Completion Checklist (UI)
- Public marketing pages built and linked.
- Auth flow enabled (email-first login).
- Founders checkout functional (Stripe).
- Library and chapter player functional with resume.
- Account page shows Founders status.
- Signed URL streaming access integrated.

## Open Items / TBD (Not Yet Specified)
- Visual design system details (typography, color palette, spacing). → [docs/ui_design_system_draft.md](./ui_design_system_draft.md)
- Component library and patterns. → [docs/ui_component_library_draft.md](./ui_component_library_draft.md)
- Error states and empty states for each page. → [docs/ui_error_empty_states_draft.md](./ui_error_empty_states_draft.md)
- Responsive breakpoints and accessibility checklists. → [docs/ui_responsive_accessibility_draft.md](./ui_responsive_accessibility_draft.md)
- Analytics events for funnel and playback. → [docs/ui_analytics_events_draft.md](./ui_analytics_events_draft.md)
