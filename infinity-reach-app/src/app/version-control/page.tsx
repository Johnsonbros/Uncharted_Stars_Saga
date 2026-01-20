'use client';

import { useState } from 'react';
import { versionControl } from '@/lib/versionControl';
import { StoryBranch, StoryCommit } from '@/types/versionControl';

export default function VersionControlPage() {
  const [branches, setBranches] = useState<StoryBranch[]>(versionControl.listBranches());
  const [currentBranch, setCurrentBranch] = useState(versionControl.getCurrentBranch());
  const [commits, setCommits] = useState<StoryCommit[]>(versionControl.getCommitHistory());
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDesc, setNewBranchDesc] = useState('');

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;
    
    try {
      const branch = versionControl.createBranch(newBranchName, currentBranch, newBranchDesc);
      setBranches(versionControl.listBranches());
      setShowNewBranch(false);
      setNewBranchName('');
      setNewBranchDesc('');
    } catch (error) {
      alert(`Error creating branch: ${error}`);
    }
  };

  const handleSwitchBranch = (branchName: string) => {
    versionControl.switchBranch(branchName);
    setCurrentBranch(branchName);
    setCommits(versionControl.getCommitHistory(branchName));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Version Control</h1>
          <p className="text-slate-600 mt-1">GitHub-style branching and commit history for your story</p>
        </div>
        <button
          onClick={() => setShowNewBranch(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Branch
        </button>
      </div>

      {/* New Branch Modal */}
      {showNewBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Branch</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g., alternative-ending"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newBranchDesc}
                  onChange={(e) => setNewBranchDesc(e.target.value)}
                  placeholder="What are you working on in this branch?"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewBranch(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBranch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branches Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Branches</h2>
        <div className="space-y-2">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                branch.name === currentBranch
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {branch.name === currentBranch ? '✓' : '🌿'}
                </span>
                <div>
                  <div className="font-semibold text-slate-900">{branch.name}</div>
                  {branch.description && (
                    <div className="text-sm text-slate-600">{branch.description}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    Created {formatDate(branch.createdAt)}
                    {branch.createdFrom && ` from ${branch.createdFrom}`}
                  </div>
                </div>
              </div>
              {branch.name !== currentBranch && (
                <button
                  onClick={() => handleSwitchBranch(branch.name)}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Switch to this branch
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Commit History */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Commit History - {currentBranch}
        </h2>
        <div className="space-y-3">
          {commits.length === 0 && (
            <p className="text-slate-600">No commits yet. Make some changes and commit them!</p>
          )}
          {commits.map((commit) => (
            <div
              key={commit.id}
              className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="text-2xl">📝</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{commit.message}</div>
                <div className="text-sm text-slate-600 mt-1">
                  by {commit.author} on {formatDate(commit.timestamp)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {commit.changes.length} change(s) • {commit.id.substring(0, 8)}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {commit.changes.map(change => (
                  <span
                    key={`${change.resourceType}-${change.resourceId}`}
                    className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                      change.type === 'create' ? 'bg-green-100 text-green-800' :
                      change.type === 'delete' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {change.type} {change.resourceType}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MCP Server Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <span>🤖</span>
          MCP Server Integration
        </h2>
        <p className="text-slate-700 mb-4">
          The MCP server is running in the background, providing story context to LLMs for writing assistance.
        </p>
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-mono text-slate-600">
            <div>Server: <span className="text-green-600">●</span> Running</div>
            <div>Current Branch: <span className="font-semibold">{currentBranch}</span></div>
            <div>Total Commits: <span className="font-semibold">{commits.length}</span></div>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-600">
          <p>Connect your LLM client (Claude Desktop, etc.) using the MCP config in mcp-config.json</p>
        </div>
      </div>
    </div>
  );
}
