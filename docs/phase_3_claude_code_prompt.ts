/**
 * ============================================================================
 * PHASE 3: LISTENER PLATFORM - CLAUDE CODE EXECUTION PROMPT
 * ============================================================================
 *
 * Project: Uncharted Stars Saga (NAOS)
 * Phase: 3 - Listener Platform
 * Target: Complete implementation in single Claude Code session
 *
 * INSTRUCTIONS FOR CLAUDE CODE:
 * 1. Read this entire file to understand all requirements
 * 2. Use TodoWrite to track progress through each task
 * 3. Implement each component following the specifications
 * 4. Run tests after each major component
 * 5. Commit changes with conventional commit messages
 * 6. Update SYSTEM_TODO.md as tasks complete
 *
 * ============================================================================
 */

// =============================================================================
// PHASE 3 OVERVIEW
// =============================================================================

/**
 * Phase 3 builds the public-facing Listener Platform - the premium audiobook
 * experience for Founders members. This phase transforms NAOS from a creator
 * tool into a complete end-to-end publishing and listening system.
 *
 * KEY PRINCIPLE: Listener Platform is STRICTLY SEPARATED from Creator OS.
 * - No shared database connections
 * - No shared authentication
 * - One-way data flow: Creator OS publishes TO Listener Platform
 * - Listener data (PII, playback) never flows back to Creator OS
 */

// =============================================================================
// TASK 1: AUTHENTICATION SYSTEM
// =============================================================================

interface Task1_Authentication {
  /**
   * TASK 1.1: Magic Link Email Authentication
   *
   * Implement passwordless authentication using magic links sent via email.
   * This is the ONLY authentication method for listeners (no passwords).
   *
   * Files to create/modify:
   * - naos/apps/web/lib/auth/magicLink.ts
   * - naos/apps/web/app/api/auth/magic-link/send/route.ts
   * - naos/apps/web/app/api/auth/magic-link/verify/route.ts
   * - naos/apps/web/app/auth/verify/page.tsx
   *
   * Requirements:
   * - Generate secure random tokens (crypto.randomUUID or similar)
   * - Token expiry: 15 minutes
   * - Single-use tokens (mark as used after verification)
   * - Rate limit: max 3 magic links per email per hour
   * - Store in magic_links table (already exists in schema)
   */
  subtask_1_1_magic_link_generation: {
    implementation: `
      // naos/apps/web/lib/auth/magicLink.ts
      export async function createMagicLink(email: string): Promise<{
        success: boolean;
        error?: string;
        expiresAt?: Date;
      }> {
        // 1. Validate email format
        // 2. Check rate limit (3 per hour per email)
        // 3. Generate secure token
        // 4. Store in magic_links table with 15-min expiry
        // 5. Send email via configured provider (Resend/SendGrid)
        // 6. Return success/error
      }

      export async function verifyMagicLink(token: string): Promise<{
        success: boolean;
        email?: string;
        listenerId?: string;
        error?: string;
      }> {
        // 1. Look up token in magic_links table
        // 2. Check if expired or already used
        // 3. Mark as used (set used_at timestamp)
        // 4. Find or create listener by email
        // 5. Create session
        // 6. Return listener info
      }
    `;
    tests: [
      "generates unique tokens for each request",
      "rejects expired tokens (>15 min)",
      "rejects already-used tokens",
      "enforces rate limit (3/hour/email)",
      "creates listener on first login",
      "returns existing listener on subsequent logins"
    ];
  };

  /**
   * TASK 1.2: Session Management
   *
   * Implement secure session management using HTTP-only cookies.
   *
   * Files to create/modify:
   * - naos/apps/web/lib/auth/session.ts
   * - naos/apps/web/middleware.ts (route protection)
   *
   * Requirements:
   * - HTTP-only, Secure, SameSite=Lax cookies
   * - Session token: 32 bytes, base64 encoded
   * - Session expiry: 30 days (configurable)
   * - Sliding expiry: refresh on each request if >50% expired
   * - Store in sessions table (already exists in schema)
   */
  subtask_1_2_session_management: {
    implementation: `
      // naos/apps/web/lib/auth/session.ts
      export const SESSION_COOKIE_NAME = "naos_session";
      export const SESSION_DURATION_DAYS = 30;

      export async function createSession(listenerId: string): Promise<string> {
        // 1. Generate secure session token
        // 2. Calculate expiry (30 days from now)
        // 3. Store in sessions table
        // 4. Return token
      }

      export async function validateSession(token: string): Promise<{
        valid: boolean;
        listenerId?: string;
        shouldRefresh?: boolean;
      }> {
        // 1. Look up session by token
        // 2. Check if expired
        // 3. Check if should refresh (>50% expired)
        // 4. Return validation result
      }

      export async function refreshSession(token: string): Promise<string | null> {
        // 1. Validate existing session
        // 2. Create new session with fresh expiry
        // 3. Invalidate old session
        // 4. Return new token
      }

      export async function destroySession(token: string): Promise<void> {
        // Delete session from database
      }
    `;
    tests: [
      "creates sessions with correct expiry",
      "validates active sessions",
      "rejects expired sessions",
      "refreshes sessions when >50% expired",
      "destroys sessions on logout"
    ];
  };

  /**
   * TASK 1.3: Protected Routes Middleware
   *
   * Implement Next.js middleware to protect authenticated routes.
   *
   * Protected routes:
   * - /library/* (audiobook library)
   * - /player/* (audio player)
   * - /account/* (account settings)
   *
   * Public routes:
   * - / (landing page)
   * - /founders (pricing page)
   * - /signup (email capture)
   * - /auth/* (authentication flows)
   */
  subtask_1_3_route_protection: {
    protectedPaths: ["/library", "/player", "/account"];
    publicPaths: ["/", "/founders", "/signup", "/auth"];
    redirectOnUnauthenticated: "/auth/login";
    redirectOnAuthenticated: "/library"; // for login page
  };
}

// =============================================================================
// TASK 2: STRIPE PAYMENT INTEGRATION
// =============================================================================

interface Task2_Payments {
  /**
   * TASK 2.1: Stripe Checkout Session
   *
   * Implement Stripe Checkout for Founders Lifetime membership ($49).
   *
   * Files to create/modify:
   * - naos/apps/web/lib/stripe/checkout.ts
   * - naos/apps/web/app/api/checkout/create/route.ts
   * - naos/apps/web/app/checkout/success/page.tsx
   * - naos/apps/web/app/checkout/cancel/page.tsx
   *
   * Requirements:
   * - Single product: Founders Lifetime ($49 one-time)
   * - Pass listener email to Stripe for receipts
   * - Success URL includes session_id for verification
   * - Cancel URL returns to /founders page
   */
  subtask_2_1_checkout_session: {
    implementation: `
      // naos/apps/web/lib/stripe/checkout.ts
      import Stripe from "stripe";

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      export const FOUNDERS_PRICE_ID = process.env.STRIPE_FOUNDERS_PRICE_ID!;

      export async function createCheckoutSession(params: {
        email: string;
        listenerId?: string;
        successUrl: string;
        cancelUrl: string;
      }): Promise<{ url: string; sessionId: string }> {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: params.email,
          line_items: [{
            price: FOUNDERS_PRICE_ID,
            quantity: 1,
          }],
          success_url: params.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: params.cancelUrl,
          metadata: {
            listener_id: params.listenerId ?? "",
            tier: "founders_lifetime",
          },
        });

        return { url: session.url!, sessionId: session.id };
      }

      export async function retrieveCheckoutSession(sessionId: string) {
        return stripe.checkout.sessions.retrieve(sessionId);
      }
    `;
    tests: [
      "creates checkout session with correct price",
      "includes customer email in session",
      "generates valid success/cancel URLs",
      "stores metadata for webhook processing"
    ];
  };

  /**
   * TASK 2.2: Stripe Webhook Handler
   *
   * Process Stripe webhooks to grant entitlements after payment.
   *
   * Files to create/modify:
   * - naos/apps/web/app/api/webhooks/stripe/route.ts (enhance existing)
   *
   * Webhook events to handle:
   * - checkout.session.completed → Grant entitlement
   * - charge.refunded → Revoke entitlement (optional for v1)
   *
   * Requirements:
   * - Verify webhook signature using STRIPE_WEBHOOK_SECRET
   * - Idempotency: store processed event IDs in stripe_events table
   * - Extract listener email/ID from session metadata
   * - Grant founders_lifetime entitlement
   */
  subtask_2_2_webhook_handler: {
    events: {
      "checkout.session.completed": `
        // 1. Verify signature
        // 2. Check idempotency (skip if event_id already processed)
        // 3. Extract email and listener_id from session
        // 4. Find or create listener by email
        // 5. Grant 'founders_lifetime' entitlement
        // 6. Store event_id in stripe_events table
        // 7. Send confirmation email (optional)
      `,
      "charge.refunded": `
        // 1. Verify signature
        // 2. Find associated checkout session
        // 3. Revoke entitlement if full refund
        // 4. Log for manual review if partial refund
      `
    };
    tests: [
      "verifies webhook signatures correctly",
      "rejects invalid signatures with 400",
      "handles checkout.session.completed",
      "grants entitlement on successful payment",
      "is idempotent (processes each event once)",
      "handles missing listener gracefully"
    ];
  };

  /**
   * TASK 2.3: Entitlement System
   *
   * Manage listener access entitlements.
   *
   * Files to create/modify:
   * - naos/apps/web/lib/entitlements/manager.ts
   * - naos/apps/web/lib/entitlements/types.ts
   *
   * Entitlement types:
   * - founders_lifetime: Full access, never expires
   * - (future) monthly_subscriber: Access while subscription active
   * - (future) preview_access: Limited chapters for free users
   */
  subtask_2_3_entitlement_system: {
    implementation: `
      // naos/apps/web/lib/entitlements/types.ts
      export type EntitlementTier =
        | "founders_lifetime"
        | "monthly_subscriber"
        | "preview_access";

      export interface Entitlement {
        id: string;
        listenerId: string;
        tier: EntitlementTier;
        status: "active" | "expired" | "revoked";
        grantedAt: Date;
        expiresAt: Date | null; // null = never expires
        stripeSessionId?: string;
      }

      // naos/apps/web/lib/entitlements/manager.ts
      export async function grantEntitlement(params: {
        listenerId: string;
        tier: EntitlementTier;
        stripeSessionId?: string;
      }): Promise<Entitlement> {
        // 1. Check if entitlement already exists
        // 2. If founders_lifetime exists, skip (idempotent)
        // 3. Create entitlement record
        // 4. Return entitlement
      }

      export async function checkEntitlement(
        listenerId: string,
        requiredTier?: EntitlementTier
      ): Promise<{
        hasAccess: boolean;
        entitlement?: Entitlement;
      }> {
        // 1. Fetch active entitlements for listener
        // 2. Check if any match required tier (or any active if not specified)
        // 3. Check expiry dates
        // 4. Return access status
      }

      export async function revokeEntitlement(
        listenerId: string,
        reason: string
      ): Promise<void> {
        // 1. Find active entitlements
        // 2. Update status to 'revoked'
        // 3. Log reason for audit trail
      }
    `;
    tests: [
      "grants entitlements correctly",
      "is idempotent (same entitlement not duplicated)",
      "checks access correctly for active entitlements",
      "respects expiry dates",
      "revokes entitlements with audit trail"
    ];
  };
}

// =============================================================================
// TASK 3: AUDIOBOOK LIBRARY
// =============================================================================

interface Task3_Library {
  /**
   * TASK 3.1: Library Page UI
   *
   * Display available audiobook chapters with progress tracking.
   *
   * Files to create/modify:
   * - naos/apps/web/app/library/page.tsx
   * - naos/apps/web/app/library/components/ChapterCard.tsx
   * - naos/apps/web/app/library/components/ProgressBar.tsx
   *
   * Requirements:
   * - Grid/list view of available chapters
   * - Show chapter title, duration, and description
   * - Show listening progress (percentage complete)
   * - "Continue Listening" section for in-progress chapters
   * - Locked state for unpublished chapters
   * - Entitlement check before rendering
   */
  subtask_3_1_library_ui: {
    components: {
      LibraryPage: `
        // Server component that checks entitlement and fetches chapters
        export default async function LibraryPage() {
          const session = await getCurrentSession();
          if (!session) redirect("/auth/login");

          const { hasAccess } = await checkEntitlement(session.listenerId);
          if (!hasAccess) redirect("/founders");

          const chapters = await getPublishedChapters();
          const progress = await getListenerProgress(session.listenerId);

          return (
            <div>
              <ContinueListening chapters={chapters} progress={progress} />
              <ChapterGrid chapters={chapters} progress={progress} />
            </div>
          );
        }
      `,
      ChapterCard: `
        // Shows chapter thumbnail, title, duration, and progress
        interface ChapterCardProps {
          chapter: Chapter;
          progress?: PlaybackProgress;
        }

        export function ChapterCard({ chapter, progress }: ChapterCardProps) {
          const percentComplete = progress
            ? (progress.positionSeconds / chapter.durationSeconds) * 100
            : 0;

          return (
            <Link href={\`/player/\${chapter.slug}\`}>
              <div className="chapter-card">
                <div className="thumbnail">
                  {/* Chapter artwork or generated gradient */}
                </div>
                <h3>{chapter.title}</h3>
                <p>{formatDuration(chapter.durationSeconds)}</p>
                {progress && <ProgressBar percent={percentComplete} />}
              </div>
            </Link>
          );
        }
      `
    };
    tests: [
      "redirects unauthenticated users to login",
      "redirects users without entitlement to pricing",
      "displays all published chapters",
      "shows correct progress for each chapter",
      "highlights continue listening section"
    ];
  };

  /**
   * TASK 3.2: Chapter Data API
   *
   * API endpoints for chapter metadata and listing.
   *
   * Files to create/modify:
   * - naos/apps/web/app/api/chapters/route.ts (list)
   * - naos/apps/web/app/api/chapters/[slug]/route.ts (detail)
   * - naos/apps/web/lib/chapters/service.ts
   *
   * Requirements:
   * - Only return published chapters to listeners
   * - Include duration, sequence order, and description
   * - Support pagination for large libraries (future)
   */
  subtask_3_2_chapter_api: {
    endpoints: {
      "GET /api/chapters": `
        // List all published chapters
        // Query params: ?limit=20&offset=0
        // Returns: { chapters: Chapter[], total: number }
      `,
      "GET /api/chapters/[slug]": `
        // Get single chapter by slug
        // Returns: { chapter: Chapter } or 404
      `
    };
    tests: [
      "returns only published chapters",
      "chapters are sorted by sequence order",
      "returns 404 for non-existent slugs",
      "includes all required metadata"
    ];
  };

  /**
   * TASK 3.3: Playback Progress API
   *
   * Track and sync listening progress across devices.
   *
   * Files to modify:
   * - naos/apps/web/app/api/playback/position/route.ts (enhance existing)
   * - naos/apps/web/lib/listenerPlaybackPositions.ts (enhance existing)
   *
   * Requirements:
   * - Save position every 10-30 seconds during playback
   * - Debounce saves to avoid excessive writes
   * - Return last position on page load
   * - Support multiple chapters (one position per chapter per listener)
   */
  subtask_3_3_progress_api: {
    endpoints: {
      "POST /api/playback/position": `
        // Save playback position
        // Body: { chapterId: string, positionSeconds: number }
        // Requires authentication
      `,
      "GET /api/playback/position": `
        // Get playback position for chapter
        // Query: ?chapterId=xxx
        // Returns: { positionSeconds: number, updatedAt: string }
      `,
      "GET /api/playback/progress": `
        // Get all progress for listener (for library view)
        // Returns: { progress: { [chapterId]: { positionSeconds, percent } } }
      `
    };
    tests: [
      "saves position for authenticated user",
      "returns saved position correctly",
      "handles multiple chapters independently",
      "returns 401 for unauthenticated requests"
    ];
  };
}

// =============================================================================
// TASK 4: AUDIO PLAYER
// =============================================================================

interface Task4_Player {
  /**
   * TASK 4.1: Audio Player Component
   *
   * Build a premium audio player optimized for long-form content.
   *
   * Files to create:
   * - naos/apps/web/app/player/[slug]/page.tsx
   * - naos/apps/web/components/player/AudioPlayer.tsx
   * - naos/apps/web/components/player/PlayerControls.tsx
   * - naos/apps/web/components/player/ProgressSlider.tsx
   * - naos/apps/web/components/player/SpeedControl.tsx
   * - naos/apps/web/hooks/useAudioPlayer.ts
   *
   * Requirements:
   * - Play/Pause with keyboard shortcut (Space)
   * - Skip forward/back 15s (Arrow keys)
   * - Playback speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
   * - Progress bar with seek functionality
   * - Time display (current / total)
   * - Volume control with mute toggle
   * - Remember playback position
   * - Auto-advance to next chapter
   */
  subtask_4_1_player_component: {
    implementation: `
      // naos/apps/web/hooks/useAudioPlayer.ts
      export function useAudioPlayer(audioUrl: string, initialPosition = 0) {
        const audioRef = useRef<HTMLAudioElement>(null);
        const [state, setState] = useState<PlayerState>({
          isPlaying: false,
          currentTime: initialPosition,
          duration: 0,
          playbackRate: 1,
          volume: 1,
          isMuted: false,
          isLoading: true,
        });

        // Methods
        const play = useCallback(() => { /* ... */ }, []);
        const pause = useCallback(() => { /* ... */ }, []);
        const seek = useCallback((time: number) => { /* ... */ }, []);
        const skipForward = useCallback(() => seek(state.currentTime + 15), []);
        const skipBack = useCallback(() => seek(state.currentTime - 15), []);
        const setPlaybackRate = useCallback((rate: number) => { /* ... */ }, []);
        const setVolume = useCallback((vol: number) => { /* ... */ }, []);
        const toggleMute = useCallback(() => { /* ... */ }, []);

        // Keyboard shortcuts
        useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") { e.preventDefault(); state.isPlaying ? pause() : play(); }
            if (e.code === "ArrowRight") { e.preventDefault(); skipForward(); }
            if (e.code === "ArrowLeft") { e.preventDefault(); skipBack(); }
          };
          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
        }, [state.isPlaying]);

        // Save position periodically
        useEffect(() => {
          if (!state.isPlaying) return;
          const interval = setInterval(() => {
            savePlaybackPosition(chapterId, state.currentTime);
          }, 15000); // Every 15 seconds
          return () => clearInterval(interval);
        }, [state.isPlaying, state.currentTime]);

        return { audioRef, state, play, pause, seek, skipForward, skipBack, setPlaybackRate, setVolume, toggleMute };
      }
    `;
    tests: [
      "plays and pauses audio",
      "seeks to specific time",
      "skips forward/back 15 seconds",
      "changes playback speed",
      "adjusts volume and mutes",
      "responds to keyboard shortcuts",
      "saves position periodically",
      "resumes from saved position"
    ];
  };

  /**
   * TASK 4.2: Signed URL Audio Streaming
   *
   * Secure audio delivery via time-limited signed URLs.
   *
   * Files to create/modify:
   * - naos/apps/web/app/api/audio/[chapterId]/route.ts
   * - naos/apps/web/lib/audio/signedUrl.ts
   *
   * Requirements:
   * - Generate signed URLs with 1-hour expiry
   * - Verify listener entitlement before generating URL
   * - URLs should work with HTML5 audio element
   * - Support range requests for seeking
   * - Log access for analytics (optional)
   */
  subtask_4_2_signed_url: {
    implementation: `
      // naos/apps/web/lib/audio/signedUrl.ts
      import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
      import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

      const s3 = new S3Client({ /* Replit Object Storage config */ });

      export async function generateSignedAudioUrl(params: {
        chapterId: string;
        listenerId: string;
      }): Promise<{ url: string; expiresAt: Date } | { error: string }> {
        // 1. Verify listener has entitlement
        const { hasAccess } = await checkEntitlement(params.listenerId);
        if (!hasAccess) {
          return { error: "No active entitlement" };
        }

        // 2. Get chapter to find storage path
        const chapter = await getChapterById(params.chapterId);
        if (!chapter || !chapter.audioStoragePath) {
          return { error: "Chapter not found or no audio" };
        }

        // 3. Generate signed URL (1 hour expiry)
        const command = new GetObjectCommand({
          Bucket: process.env.AUDIO_BUCKET!,
          Key: chapter.audioStoragePath,
        });

        const expiresIn = 3600; // 1 hour
        const url = await getSignedUrl(s3, command, { expiresIn });
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        return { url, expiresAt };
      }
    `;
    tests: [
      "generates valid signed URLs",
      "URLs expire after 1 hour",
      "rejects requests without entitlement",
      "returns error for non-existent chapters",
      "supports audio playback via generated URL"
    ];
  };

  /**
   * TASK 4.3: Player Page
   *
   * Full player page with chapter info and controls.
   *
   * Files to create:
   * - naos/apps/web/app/player/[slug]/page.tsx
   * - naos/apps/web/app/player/[slug]/loading.tsx
   *
   * Requirements:
   * - Display chapter title and description
   * - Show chapter artwork (or generated gradient)
   * - Full audio player controls
   * - "Next Chapter" button when available
   * - "Back to Library" link
   * - Mobile-responsive design
   */
  subtask_4_3_player_page: {
    implementation: `
      // naos/apps/web/app/player/[slug]/page.tsx
      export default async function PlayerPage({ params }: { params: { slug: string } }) {
        const session = await getCurrentSession();
        if (!session) redirect("/auth/login");

        const { hasAccess } = await checkEntitlement(session.listenerId);
        if (!hasAccess) redirect("/founders");

        const chapter = await getChapterBySlug(params.slug);
        if (!chapter) notFound();

        const { url: audioUrl } = await generateSignedAudioUrl({
          chapterId: chapter.id,
          listenerId: session.listenerId,
        });

        const savedPosition = await getPlaybackPosition(
          session.listenerId,
          chapter.id
        );

        const nextChapter = await getNextChapter(chapter.sequenceOrder);

        return (
          <div className="player-page">
            <header>
              <Link href="/library">← Back to Library</Link>
              <h1>{chapter.title}</h1>
              {chapter.subtitle && <h2>{chapter.subtitle}</h2>}
            </header>

            <main>
              <ChapterArtwork chapter={chapter} />
              <AudioPlayer
                audioUrl={audioUrl}
                initialPosition={savedPosition?.positionSeconds ?? 0}
                chapterId={chapter.id}
              />
              {chapter.description && (
                <section className="description">
                  <p>{chapter.description}</p>
                </section>
              )}
            </main>

            <footer>
              {nextChapter && (
                <Link href={\`/player/\${nextChapter.slug}\`}>
                  Next: {nextChapter.title} →
                </Link>
              )}
            </footer>
          </div>
        );
      }
    `;
    tests: [
      "loads chapter correctly by slug",
      "generates audio URL for playback",
      "resumes from saved position",
      "shows next chapter link when available",
      "redirects unauthorized users"
    ];
  };
}

// =============================================================================
// TASK 5: MARKETING PAGES
// =============================================================================

interface Task5_Marketing {
  /**
   * TASK 5.1: Landing Page Enhancement
   *
   * Enhance the landing page with compelling content.
   *
   * Files to modify:
   * - naos/apps/web/app/page.tsx
   * - naos/apps/web/app/globals.css
   *
   * Sections:
   * - Hero with audio trailer teaser
   * - "What is Uncharted Stars Saga?" section
   * - Sample audio clip (30-60 seconds)
   * - Founders membership benefits
   * - FAQ section
   * - CTA to /founders
   */
  subtask_5_1_landing_page: {
    sections: [
      "Hero: Title, tagline, audio waveform animation, CTA",
      "Story: Brief series premise without spoilers",
      "Sample: 60-second audio preview with mini-player",
      "Founders: Benefits list, $49 price, lifetime access",
      "FAQ: Common questions about format, access, etc.",
      "Footer: Links, copyright, contact"
    ];
  };

  /**
   * TASK 5.2: Founders Pricing Page
   *
   * Dedicated page for Founders membership conversion.
   *
   * Files to modify:
   * - naos/apps/web/app/founders/page.tsx
   * - naos/apps/web/app/founders/components/PricingCard.tsx
   * - naos/apps/web/app/founders/components/BenefitsList.tsx
   *
   * Requirements:
   * - Clear pricing ($49 one-time)
   * - Benefits list with icons
   * - Comparison with potential future tiers
   * - FAQ specific to membership
   * - Checkout button that requires email
   * - Trust signals (secure payment, money-back guarantee)
   */
  subtask_5_2_founders_page: {
    content: {
      headline: "Join the Founders Circle",
      subheadline: "Lifetime access to the complete Uncharted Stars Saga",
      price: "$49",
      priceNote: "One-time payment. No subscriptions.",
      benefits: [
        "Immediate access to all published chapters",
        "All future chapters included forever",
        "Ad-free premium listening experience",
        "Resume playback across all devices",
        "Direct support for independent creation",
        "Founder-exclusive bonus content (coming soon)"
      ],
      guarantee: "30-day money-back guarantee. No questions asked.",
      cta: "Become a Founder"
    };
  };

  /**
   * TASK 5.3: Email Capture Flow
   *
   * Collect email before checkout for recovery and marketing.
   *
   * Files to modify:
   * - naos/apps/web/app/signup/page.tsx (enhance existing)
   * - naos/apps/web/app/signup/SignupForm.tsx
   *
   * Flow:
   * 1. User clicks "Become a Founder" → /signup?redirect=checkout
   * 2. Enter email → Store in listeners table (pending status)
   * 3. Redirect to Stripe Checkout
   * 4. On success → Listener status becomes active
   */
  subtask_5_3_email_capture: {
    implementation: `
      // User flow:
      // 1. /founders "Become a Founder" button → /signup?redirect=checkout
      // 2. Email form submission:
      //    - Validate email
      //    - Find or create listener (status: pending)
      //    - Create Stripe Checkout session
      //    - Redirect to Stripe
      // 3. After payment:
      //    - Webhook grants entitlement
      //    - Listener status → active
      //    - Redirect to /library
    `;
  };
}

// =============================================================================
// TASK 6: ACCOUNT MANAGEMENT
// =============================================================================

interface Task6_Account {
  /**
   * TASK 6.1: Account Settings Page
   *
   * Allow listeners to manage their account.
   *
   * Files to create:
   * - naos/apps/web/app/account/page.tsx
   * - naos/apps/web/app/account/components/AccountInfo.tsx
   * - naos/apps/web/app/account/components/EntitlementStatus.tsx
   *
   * Features:
   * - Display email address
   * - Show entitlement status and tier
   * - Listening history summary
   * - Logout button
   * - (Future) Update email, delete account
   */
  subtask_6_1_account_page: {
    sections: [
      "Email display (masked: j***@example.com)",
      "Membership status: Founders Lifetime",
      "Member since: [date]",
      "Listening stats: X chapters, Y hours",
      "Logout button",
      "Support contact link"
    ];
  };

  /**
   * TASK 6.2: Logout Flow
   *
   * Secure logout that destroys session.
   *
   * Files to create:
   * - naos/apps/web/app/api/auth/logout/route.ts
   * - naos/apps/web/app/auth/logout/page.tsx (optional confirmation)
   *
   * Requirements:
   * - POST endpoint to destroy session
   * - Clear session cookie
   * - Redirect to landing page
   * - Invalidate session in database
   */
  subtask_6_2_logout: {
    implementation: `
      // naos/apps/web/app/api/auth/logout/route.ts
      export async function POST(request: Request) {
        const session = await getCurrentSession();

        if (session) {
          await destroySession(session.token);
        }

        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete(SESSION_COOKIE_NAME);

        return response;
      }
    `;
  };
}

// =============================================================================
// TASK 7: TESTING & INTEGRATION
// =============================================================================

interface Task7_Testing {
  /**
   * TASK 7.1: Unit Tests
   *
   * Write unit tests for all new functionality.
   *
   * Test files to create:
   * - naos/apps/web/lib/__tests__/magicLink.test.ts
   * - naos/apps/web/lib/__tests__/session.test.ts
   * - naos/apps/web/lib/__tests__/checkout.test.ts
   * - naos/apps/web/lib/__tests__/entitlements.test.ts
   * - naos/apps/web/lib/__tests__/signedUrl.test.ts
   * - naos/apps/web/lib/__tests__/chapters.test.ts
   */
  unitTests: [
    "Magic link generation and verification",
    "Session creation, validation, and refresh",
    "Checkout session creation",
    "Webhook signature verification",
    "Entitlement grant and check",
    "Signed URL generation",
    "Chapter listing and filtering"
  ];

  /**
   * TASK 7.2: Integration Tests
   *
   * Test complete user flows.
   *
   * Test files to create:
   * - naos/apps/web/tests/e2e/auth-flow.spec.ts
   * - naos/apps/web/tests/e2e/checkout-flow.spec.ts
   * - naos/apps/web/tests/e2e/library-flow.spec.ts
   * - naos/apps/web/tests/e2e/player-flow.spec.ts
   */
  integrationTests: [
    "Complete signup → checkout → library flow",
    "Magic link login flow",
    "Protected route redirects",
    "Audio playback and position saving",
    "Session persistence across page loads"
  ];

  /**
   * TASK 7.3: Update SYSTEM_TODO.md
   *
   * Mark all Phase 3 items as complete with verification notes.
   */
  documentation: [
    "Update SYSTEM_TODO.md with Phase 3 completion status",
    "Add test run results",
    "Document any deferred items for Phase 4",
    "Update CLAUDE.md if new patterns established"
  ];
}

// =============================================================================
// EXECUTION ORDER
// =============================================================================

/**
 * Recommended execution order for Claude Code:
 *
 * 1. TASK 1: Authentication (foundation for everything else)
 *    - 1.1 Magic links
 *    - 1.2 Sessions
 *    - 1.3 Route protection
 *
 * 2. TASK 2: Payments (enables monetization)
 *    - 2.1 Checkout
 *    - 2.2 Webhooks
 *    - 2.3 Entitlements
 *
 * 3. TASK 3: Library (core experience)
 *    - 3.1 Library UI
 *    - 3.2 Chapter API
 *    - 3.3 Progress API
 *
 * 4. TASK 4: Player (core experience)
 *    - 4.1 Player component
 *    - 4.2 Signed URLs
 *    - 4.3 Player page
 *
 * 5. TASK 5: Marketing (conversion)
 *    - 5.1 Landing page
 *    - 5.2 Founders page
 *    - 5.3 Email capture
 *
 * 6. TASK 6: Account (polish)
 *    - 6.1 Account page
 *    - 6.2 Logout
 *
 * 7. TASK 7: Testing (verification)
 *    - 7.1 Unit tests
 *    - 7.2 Integration tests
 *    - 7.3 Documentation
 *
 * After each task:
 * - Run `npm test` to verify no regressions
 * - Commit with conventional commit message
 * - Update TodoWrite progress
 */

// =============================================================================
// ENVIRONMENT VARIABLES REQUIRED
// =============================================================================

/**
 * Ensure these are set in .env.local or Replit Secrets:
 *
 * # Stripe
 * STRIPE_SECRET_KEY=sk_test_...
 * STRIPE_WEBHOOK_SECRET=whsec_...
 * STRIPE_FOUNDERS_PRICE_ID=price_...
 *
 * # Email (Resend recommended)
 * RESEND_API_KEY=re_...
 * EMAIL_FROM=noreply@unchartedstarssaga.com
 *
 * # Storage (Replit Object Storage)
 * AUDIO_BUCKET=audio-files
 *
 * # App
 * NEXT_PUBLIC_APP_URL=https://your-replit-url.repl.co
 * SESSION_SECRET=<32+ random bytes>
 */

export {};
