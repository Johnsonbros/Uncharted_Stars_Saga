import { Suspense } from "react";
import Link from "next/link";
import CheckoutSuccessContent from "./CheckoutSuccessContent";

function LoadingState() {
  return (
    <div className="hero-content">
      <span className="tag">Verifying...</span>
      <h1>Confirming your purchase</h1>
      <p>Please wait while we verify your payment and set up your account.</p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="tag">Checkout complete</span>
          <Link href="/">
            <strong>Uncharted Stars Saga</strong>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <Suspense fallback={<LoadingState />}>
          <CheckoutSuccessContent />
        </Suspense>
      </section>

      <section className="footer">
        <strong>NAOS Listener Platform</strong>
        <span>Built for audio-first storytelling.</span>
        <span>Need help? hello@unchartedstars.ai</span>
      </section>
    </main>
  );
}
