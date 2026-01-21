const { ERROR_CODES } = require("./errors");
const { validateProposal } = require("./validation");

const proposals = new Map();
const auditLog = [];

function createProposal({ toolName, payload, submittedBy }) {
  const validation = validateProposal({ toolName, payload });
  if (!validation.valid) {
    return {
      error: ERROR_CODES.invalidProposal,
      data: { issues: validation.issues },
    };
  }

  const proposalId = `prop_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const proposal = {
    id: proposalId,
    toolName,
    payload,
    status: "draft",
    submittedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  proposals.set(proposalId, proposal);
  auditLog.push({
    proposalId,
    action: "created",
    at: proposal.createdAt,
    metadata: { toolName, submittedBy },
  });

  return { result: proposal };
}

function transitionProposal({ proposalId, nextStatus, actor }) {
  const proposal = proposals.get(proposalId);
  if (!proposal) {
    return {
      error: ERROR_CODES.proposalState,
      data: { proposalId, reason: "missing" },
    };
  }

  const allowedTransitions = {
    draft: ["submitted"],
    submitted: ["validated", "rejected"],
    validated: ["applied", "rejected"],
    applied: ["archived"],
    rejected: ["archived"],
    archived: [],
  };

  if (!allowedTransitions[proposal.status].includes(nextStatus)) {
    return {
      error: ERROR_CODES.proposalState,
      data: { proposalId, from: proposal.status, to: nextStatus },
    };
  }

  proposal.status = nextStatus;
  proposal.updatedAt = new Date().toISOString();
  proposals.set(proposalId, proposal);

  auditLog.push({
    proposalId,
    action: `status:${nextStatus}`,
    at: proposal.updatedAt,
    metadata: { actor },
  });

  return { result: proposal };
}

function getProposal({ proposalId }) {
  return proposals.get(proposalId) || null;
}

function listAuditLog({ proposalId } = {}) {
  if (!proposalId) {
    return auditLog.slice();
  }
  return auditLog.filter((entry) => entry.proposalId === proposalId);
}

module.exports = {
  createProposal,
  transitionProposal,
  getProposal,
  listAuditLog,
};
