// Story Version Control System (GitHub-style for writing)

import { 
  StoryCommit, 
  StoryChange, 
  StoryBranch, 
  StoryVersion,
  PullRequest,
  DiffResult 
} from '@/types/versionControl';
import { Chapter, Scene, Character, Location, Note } from '@/types';

class StoryVersionControl {
  private commits: Map<string, StoryCommit> = new Map();
  private branches: Map<string, StoryBranch> = new Map();
  private versions: Map<string, StoryVersion> = new Map();
  private pullRequests: Map<string, PullRequest> = new Map();
  private currentBranch: string = 'main';

  constructor() {
    // Initialize main branch
    this.branches.set('main', {
      name: 'main',
      headCommitId: 'initial',
      createdAt: new Date(),
      createdFrom: '',
      description: 'Main storyline',
      isActive: true,
    });

    // Create initial commit
    this.createInitialCommit();
  }

  private createInitialCommit() {
    const initialCommit: StoryCommit = {
      id: 'initial',
      message: 'Initial story setup',
      author: 'Nate Johnson',
      timestamp: new Date(),
      branch: 'main',
      changes: [],
    };
    this.commits.set('initial', initialCommit);
  }

  // Branch operations (like git)
  createBranch(name: string, fromBranch: string = 'main', description: string = ''): StoryBranch {
    const sourceBranch = this.branches.get(fromBranch);
    if (!sourceBranch) {
      throw new Error(`Source branch ${fromBranch} not found`);
    }

    const newBranch: StoryBranch = {
      name,
      headCommitId: sourceBranch.headCommitId,
      createdAt: new Date(),
      createdFrom: fromBranch,
      description: description || `Branch for ${name}`,
      isActive: true,
    };

    this.branches.set(name, newBranch);
    return newBranch;
  }

  switchBranch(branchName: string): void {
    if (!this.branches.has(branchName)) {
      throw new Error(`Branch ${branchName} not found`);
    }
    this.currentBranch = branchName;
  }

  getCurrentBranch(): string {
    return this.currentBranch;
  }

  listBranches(): StoryBranch[] {
    return Array.from(this.branches.values());
  }

  // Commit operations
  commit(
    message: string,
    changes: StoryChange[],
    author: string = 'Nate Johnson'
  ): StoryCommit {
    const branch = this.branches.get(this.currentBranch);
    if (!branch) {
      throw new Error(`Current branch ${this.currentBranch} not found`);
    }

    const commit: StoryCommit = {
      id: `commit-${Date.now()}`,
      message,
      author,
      timestamp: new Date(),
      branch: this.currentBranch,
      parentCommitId: branch.headCommitId,
      changes,
    };

    this.commits.set(commit.id, commit);
    branch.headCommitId = commit.id;

    return commit;
  }

  getCommitHistory(branchName?: string, limit: number = 50): StoryCommit[] {
    const branch = this.branches.get(branchName || this.currentBranch);
    if (!branch) return [];

    const history: StoryCommit[] = [];
    let currentCommitId: string | undefined = branch.headCommitId;

    while (currentCommitId && history.length < limit) {
      const commit = this.commits.get(currentCommitId);
      if (!commit) break;
      
      history.push(commit);
      currentCommitId = commit.parentCommitId;
    }

    return history;
  }

  // Diff operations
  diff(commitId1: string, commitId2: string): DiffResult[] {
    const commit1 = this.commits.get(commitId1);
    const commit2 = this.commits.get(commitId2);

    if (!commit1 || !commit2) {
      throw new Error('One or both commits not found');
    }

    // Simplified diff - in real implementation, would compare full snapshots
    const results: DiffResult[] = [];
    
    commit2.changes.forEach(change => {
      results.push({
        resourceType: change.resourceType,
        resourceId: change.resourceId,
        changes: [{
          field: 'content',
          before: JSON.stringify(change.before),
          after: JSON.stringify(change.after),
          type: change.type === 'create' ? 'addition' : 
                change.type === 'delete' ? 'deletion' : 'modification',
        }],
      });
    });

    return results;
  }

  // Pull Request operations
  createPullRequest(
    title: string,
    description: string,
    sourceBranch: string,
    targetBranch: string = 'main',
    author: string = 'Nate Johnson'
  ): PullRequest {
    const source = this.branches.get(sourceBranch);
    const target = this.branches.get(targetBranch);

    if (!source || !target) {
      throw new Error('Source or target branch not found');
    }

    // Get commits in source that aren't in target
    const sourceHistory = this.getCommitHistory(sourceBranch);
    const targetHistory = this.getCommitHistory(targetBranch);
    const targetCommitIds = new Set(targetHistory.map(c => c.id));
    const newCommits = sourceHistory
      .filter(c => !targetCommitIds.has(c.id))
      .map(c => c.id);

    const pr: PullRequest = {
      id: `pr-${Date.now()}`,
      title,
      description,
      sourceBranch,
      targetBranch,
      status: 'open',
      commits: newCommits,
      createdAt: new Date(),
      updatedAt: new Date(),
      author,
    };

    this.pullRequests.set(pr.id, pr);
    return pr;
  }

  mergePullRequest(prId: string): void {
    const pr = this.pullRequests.get(prId);
    if (!pr) {
      throw new Error('Pull request not found');
    }

    if (pr.status !== 'open') {
      throw new Error('Pull request is not open');
    }

    // Simplified merge - in real implementation, would handle conflicts
    const targetBranch = this.branches.get(pr.targetBranch);
    const sourceBranch = this.branches.get(pr.sourceBranch);

    if (!targetBranch || !sourceBranch) {
      throw new Error('Branch not found');
    }

    // Create merge commit
    const mergeCommit: StoryCommit = {
      id: `merge-${Date.now()}`,
      message: `Merge ${pr.sourceBranch} into ${pr.targetBranch}`,
      author: pr.author,
      timestamp: new Date(),
      branch: pr.targetBranch,
      parentCommitId: targetBranch.headCommitId,
      changes: [],
    };

    this.commits.set(mergeCommit.id, mergeCommit);
    targetBranch.headCommitId = mergeCommit.id;

    pr.status = 'merged';
    pr.updatedAt = new Date();
  }

  listPullRequests(status?: 'open' | 'merged' | 'closed'): PullRequest[] {
    const prs = Array.from(this.pullRequests.values());
    if (status) {
      return prs.filter(pr => pr.status === status);
    }
    return prs;
  }

  // Save/restore snapshots
  createSnapshot(commitId: string, snapshot: any): void {
    const commit = this.commits.get(commitId);
    if (!commit) {
      throw new Error('Commit not found');
    }

    const version: StoryVersion = {
      commitId,
      branch: commit.branch,
      timestamp: commit.timestamp,
      snapshot,
    };

    this.versions.set(commitId, version);
  }

  getSnapshot(commitId: string): StoryVersion | undefined {
    return this.versions.get(commitId);
  }

  // Export for persistence
  export(): any {
    return {
      commits: Array.from(this.commits.entries()),
      branches: Array.from(this.branches.entries()),
      versions: Array.from(this.versions.entries()),
      pullRequests: Array.from(this.pullRequests.entries()),
      currentBranch: this.currentBranch,
    };
  }

  // Import from persistence
  import(data: any): void {
    this.commits = new Map(data.commits);
    this.branches = new Map(data.branches);
    this.versions = new Map(data.versions);
    this.pullRequests = new Map(data.pullRequests);
    this.currentBranch = data.currentBranch;
  }
}

// Export singleton
export const versionControl = new StoryVersionControl();
