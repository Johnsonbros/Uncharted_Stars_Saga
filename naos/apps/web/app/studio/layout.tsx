import Link from "next/link";
import type { ReactNode } from "react";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="studio-shell">
      <header className="studio-header">
        <div className="studio-brand">
          <span className="tag">Creator Studio</span>
          <div>
            <strong>Uncharted Stars Saga</strong>
            <p className="muted">Bring a story idea to life with guided AI support.</p>
          </div>
        </div>
        <nav className="studio-nav">
          <Link href="/">Listener home</Link>
          <Link href="/studio">Dashboard</Link>
          <Link href="/studio/intake">Story intake</Link>
          <Link href="/studio/scenes/act_01_discovery%2Fch_01_elara_scene_01.md">
            Sample scene
          </Link>
          <Link href="/studio/proposals">AI proposals</Link>
        </nav>
      </header>
      <main className="studio-main">{children}</main>
    </div>
  );
}
