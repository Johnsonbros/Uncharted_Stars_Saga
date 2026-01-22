import LibraryStatus from "./LibraryStatus";

const chapters = [
  {
    title: "Act I: Discovery",
    runtime: "46 min",
    highlight: "Resume from 18:42"
  },
  {
    title: "Act II: The Relay",
    runtime: "39 min",
    highlight: "New release"
  },
  {
    title: "Act III: Echo Vault",
    runtime: "52 min",
    highlight: "Includes bonus commentary"
  }
];

type LibraryPageProps = {
  searchParams?:
    | {
        email?: string;
      }
    | Promise<{
        email?: string;
      }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams?.email ?? "";

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="tag">Listener library</span>
          <h1>Your Uncharted Stars library</h1>
          <p>
            Founders access unlocks every chapter, bonus drop, and listening
            note in the Uncharted Stars Saga universe.
          </p>
          <div className="hero-actions">
            <LibraryStatus email={email} />
          </div>
        </div>
        <div className="hero-card">
          <div>
            <h3>Now ready to play</h3>
            <p className="muted">
              Pick up your latest chapter or start the saga from the beginning.
            </p>
          </div>
          <ul className="hero-list">
            {chapters.map(chapter => (
              <li key={chapter.title}>
                <strong>{chapter.title}</strong> · {chapter.runtime}
                <span className="muted" style={{ display: "block" }}>
                  {chapter.highlight}
                </span>
              </li>
            ))}
          </ul>
          <a className="button" href="/">
            Back to overview
          </a>
        </div>
      </section>
    </main>
  );
}
