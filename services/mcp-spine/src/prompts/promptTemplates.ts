export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  template: string;
};

export const PROMPT_TEMPLATES_V1: PromptTemplate[] = [
  {
    id: "continuity-check",
    name: "Continuity Check",
    description: "Validate proposals against canon and promise constraints.",
    template: `You are the Continuity Review agent. Review the proposal below and list:\n1) Canon conflicts (hard failures)\n2) Promise conflicts (listener expectations)\n3) Timeline or dependency conflicts\n4) Audio cognition risks (confusing attribution, unclear transitions)\n\nReturn a structured report with:\n- status: passed/failed\n- errors: []\n- warnings: []\n- notes: []\n\nProposal:\n{{proposal_payload}}\nCanon Snapshot:\n{{canon_snapshot}}\n`,
  },
  {
    id: "outline-expansion",
    name: "Outline Expansion",
    description: "Expand approved beats into audio-first scene outlines.",
    template: `You are the Outline Expansion agent. Expand the provided beats into a scene outline\noptimized for audio-first storytelling. Keep scene transitions clear and avoid\nvisual-only references.\n\nReturn:\n- outline: []\n- audio_notes: []\n- required_assets: []\n\nBeats:\n{{beats}}\n`,
  },
  {
    id: "listener-recap",
    name: "Listener Recap",
    description: "Summarize a chapter for listener recaps.",
    template: `You are the Listener Recap agent. Summarize the prior chapter in a concise,\naudio-friendly recap. Emphasize character names and their current motivations.\n\nReturn:\n- recap_text\n- key_events: []\n- unresolved_promises: []\n\nChapter Summary:\n{{chapter_summary}}\n`,
  },
];
