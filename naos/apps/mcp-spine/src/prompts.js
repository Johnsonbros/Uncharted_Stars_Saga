const PROMPTS = [
  {
    name: "continuity_check",
    description: "Prompt template for continuity checks.",
    content: "Analyze the provided narrative scope for continuity issues and contradictions.",
  },
  {
    name: "outline_recap",
    description: "Prompt template for summaries and recaps.",
    content: "Provide an audio-first recap focused on causal continuity and character knowledge.",
  },
];

function listPrompts() {
  return PROMPTS.map(({ name, description }) => ({ name, description }));
}

function getPrompt({ name }) {
  return PROMPTS.find((prompt) => prompt.name === name) || null;
}

module.exports = {
  listPrompts,
  getPrompt,
};
