import { PROPOSAL_SCHEMA_V1 } from "./proposalSchemaV1.js";

export const PROPOSAL_SCHEMA_REGISTRY = {
  v1: PROPOSAL_SCHEMA_V1,
};

export type ProposalSchemaVersion = keyof typeof PROPOSAL_SCHEMA_REGISTRY;
