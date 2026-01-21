"use client";

import { useMemo, useState } from "react";

const audiences = ["Young adult", "Cozy sci-fi", "Dark fantasy", "Audio drama fans"];
const deliveryOptions = [
  "Single short story",
  "Mini-series (3 episodes)",
  "Season launch (5 episodes)"
];

export default function StoryIntakePage() {
  const [storyPromise, setStoryPromise] = useState(
    "Listeners will discover one unexpected truth by the end."
  );
  const [audience, setAudience] = useState(audiences[0]);
  const [delivery, setDelivery] = useState(deliveryOptions[0]);
  const [emotions, setEmotions] = useState("Wonder, bravery, quiet joy");
  const [note, setNote] = useState("Keep the vocabulary simple and intimate.");

  const preview = useMemo(
    () =>
      `Promise: ${storyPromise} Audience: ${audience}. Delivery: ${delivery}. Emotional arc: ${emotions}.`,
    [storyPromise, audience, delivery, emotions]
  );

  return (
    <section className="studio-section">
      <div className="studio-card">
        <h2>Story intake</h2>
        <p className="muted">
          This is a guided intake that turns your idea into clear creative direction. The preview
          updates instantly as you type.
        </p>
        <div className="studio-grid two">
          <label>
            Story promise
            <textarea
              rows={3}
              value={storyPromise}
              onChange={(event) => setStoryPromise(event.target.value)}
              placeholder="What must the listener feel or learn by the end?"
            />
          </label>
          <label>
            Listener audience
            <select value={audience} onChange={(event) => setAudience(event.target.value)}>
              {audiences.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Delivery plan
            <select value={delivery} onChange={(event) => setDelivery(event.target.value)}>
              {deliveryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Emotional arc
            <input
              value={emotions}
              onChange={(event) => setEmotions(event.target.value)}
              placeholder="Hopeful, eerie, triumphant"
            />
          </label>
          <label>
            Personal note to your AI director
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Any special requests for tone, pacing, or language?"
            />
          </label>
          <div className="studio-card soft">
            <h3>Live creative brief</h3>
            <p>{preview}</p>
            <p className="muted">Note: {note}</p>
            <button className="button">Save & generate outline</button>
          </div>
        </div>
      </div>
    </section>
  );
}
