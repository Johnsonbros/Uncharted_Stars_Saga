import Link from "next/link";

interface ListenerNavProps {
  currentPath?: string;
}

export default function ListenerNav({ currentPath }: ListenerNavProps) {
  return (
    <nav className="nav">
      <div className="brand">
        <span className="tag">NAOS Listener Platform</span>
        <Link href="/">
          <strong>Uncharted Stars Saga</strong>
        </Link>
      </div>
      <div className="nav-links">
        <Link
          href="/library"
          style={currentPath === "/library" ? { color: "var(--accent)" } : undefined}
        >
          Library
        </Link>
        <Link
          href="/account"
          style={currentPath === "/account" ? { color: "var(--accent)" } : undefined}
        >
          Account
        </Link>
      </div>
    </nav>
  );
}
