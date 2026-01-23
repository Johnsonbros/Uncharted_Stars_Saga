import type { Logger } from "./types/loggerTypes.js";

/**
 * Voice profile defining narration characteristics
 */
export interface VoiceProfile {
  id: string;
  name: string;
  role: "narrator" | "character" | "hybrid";

  // Audio characteristics
  tempo: number; // Words per minute (baseline)
  authority: number; // 0.0-1.0 (narrator confidence level)
  emotionalRange: {
    min: number; // 0.0-1.0
    max: number; // 0.0-1.0
  };

  // Voice modulation
  tone: "neutral" | "warm" | "cold" | "dramatic" | "intimate";
  pace: "slow" | "medium" | "fast";
  cadenceWPM: number; // Actual words per minute

  // Character-specific (for character voices)
  characterId?: string;
  ageRange?: "child" | "young_adult" | "adult" | "elderly";
  gender?: "male" | "female" | "neutral";
  accent?: string;

  // Production notes
  allowedQuirks: string[]; // Acceptable vocal variations
  forbiddenPatterns: string[]; // Things to avoid
  pronunciationNotes: Array<{
    word: string;
    pronunciation: string;
  }>;
  styleTags: string[]; // e.g., ["mysterious", "authoritative", "gentle"]

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

/**
 * Voice consistency check result
 */
export interface VoiceConsistencyCheck {
  consistent: boolean;
  issues: string[];
  suggestions: string[];
  score: number; // 0.0-1.0
}

/**
 * Voice profile comparison
 */
export interface VoiceProfileComparison {
  similarity: number; // 0.0-1.0
  differences: Array<{
    attribute: string;
    profile1Value: unknown;
    profile2Value: unknown;
  }>;
}

/**
 * Voice Profile Manager
 *
 * Manages voice profiles for narrators and characters.
 * Ensures voice consistency across scenes and chapters.
 */
export class VoiceProfileManager {
  private logger: Logger;
  private profiles: Map<string, VoiceProfile>;
  private characterProfiles: Map<string, string>; // characterId -> voiceProfileId

  constructor(logger: Logger) {
    this.logger = logger;
    this.profiles = new Map();
    this.characterProfiles = new Map();

    this.logger.info("VoiceProfileManager initialized");
  }

  /**
   * Create a new voice profile
   */
  createProfile(
    name: string,
    role: VoiceProfile["role"],
    options: {
      characterId?: string;
      tempo?: number;
      authority?: number;
      emotionalRange?: VoiceProfile["emotionalRange"];
      tone?: VoiceProfile["tone"];
      pace?: VoiceProfile["pace"];
      ageRange?: VoiceProfile["ageRange"];
      gender?: VoiceProfile["gender"];
      accent?: string;
      styleTags?: string[];
    } = {}
  ): VoiceProfile {
    const profile: VoiceProfile = {
      id: this.generateProfileId(name),
      name,
      role,
      tempo: options.tempo || 150,
      authority: options.authority || 0.7,
      emotionalRange: options.emotionalRange || { min: 0.3, max: 0.8 },
      tone: options.tone || "neutral",
      pace: options.pace || "medium",
      cadenceWPM: options.tempo || 150,
      characterId: options.characterId,
      ageRange: options.ageRange,
      gender: options.gender,
      accent: options.accent,
      allowedQuirks: [],
      forbiddenPatterns: [],
      pronunciationNotes: [],
      styleTags: options.styleTags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    this.profiles.set(profile.id, profile);

    // If character profile, map character to profile
    if (profile.characterId) {
      this.characterProfiles.set(profile.characterId, profile.id);
    }

    this.logger.info("voice_profile.created", {
      profile_id: profile.id,
      name,
      role,
      character_id: profile.characterId,
    });

    return profile;
  }

  /**
   * Get a voice profile by ID
   */
  getProfile(profileId: string): VoiceProfile | undefined {
    return this.profiles.get(profileId);
  }

  /**
   * Get voice profile for a character
   */
  getProfileForCharacter(characterId: string): VoiceProfile | undefined {
    const profileId = this.characterProfiles.get(characterId);
    if (!profileId) return undefined;
    return this.profiles.get(profileId);
  }

  /**
   * Update voice profile attributes
   */
  updateProfile(profileId: string, updates: Partial<Omit<VoiceProfile, "id" | "createdAt">>): void {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Voice profile ${profileId} not found`);
    }

    Object.assign(profile, updates);
    profile.updatedAt = new Date();
    profile.version += 1;

    this.logger.info("voice_profile.updated", {
      profile_id: profileId,
      version: profile.version,
    });
  }

  /**
   * Add pronunciation note
   */
  addPronunciationNote(profileId: string, word: string, pronunciation: string): void {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Voice profile ${profileId} not found`);
    }

    profile.pronunciationNotes.push({ word, pronunciation });
    profile.updatedAt = new Date();

    this.logger.info("voice_profile.pronunciation_added", {
      profile_id: profileId,
      word,
    });
  }

  /**
   * Add allowed quirk
   */
  addAllowedQuirk(profileId: string, quirk: string): void {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Voice profile ${profileId} not found`);
    }

    if (!profile.allowedQuirks.includes(quirk)) {
      profile.allowedQuirks.push(quirk);
      profile.updatedAt = new Date();

      this.logger.info("voice_profile.quirk_added", {
        profile_id: profileId,
        quirk,
      });
    }
  }

  /**
   * Add forbidden pattern
   */
  addForbiddenPattern(profileId: string, pattern: string): void {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Voice profile ${profileId} not found`);
    }

    if (!profile.forbiddenPatterns.includes(pattern)) {
      profile.forbiddenPatterns.push(pattern);
      profile.updatedAt = new Date();

      this.logger.info("voice_profile.forbidden_pattern_added", {
        profile_id: profileId,
        pattern,
      });
    }
  }

  /**
   * Check voice consistency across scenes
   */
  checkConsistency(
    profileId: string,
    sceneVoiceProfiles: string[]
  ): VoiceConsistencyCheck {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      return {
        consistent: false,
        issues: [`Profile ${profileId} not found`],
        suggestions: [],
        score: 0,
      };
    }

    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check if same profile used across all scenes
    const inconsistentScenes = sceneVoiceProfiles.filter(id => id !== profileId);
    if (inconsistentScenes.length > 0) {
      issues.push(`${inconsistentScenes.length} scenes use different voice profiles`);
      suggestions.push("Ensure all scenes for this character use the same voice profile");
    }

    // Check profile completeness
    if (!profile.characterId && profile.role === "character") {
      issues.push("Character voice profile not linked to a character");
      suggestions.push("Assign this voice profile to a specific character");
    }

    if (profile.pronunciationNotes.length === 0) {
      suggestions.push("Consider adding pronunciation notes for consistency");
    }

    if (profile.styleTags.length === 0) {
      suggestions.push("Add style tags to help guide voice direction");
    }

    // Calculate consistency score
    const score = this.calculateConsistencyScore(profile, issues.length);

    const consistent = issues.length === 0;

    this.logger.info("voice_profile.consistency_checked", {
      profile_id: profileId,
      consistent,
      issue_count: issues.length,
      score,
    });

    return {
      consistent,
      issues,
      suggestions,
      score,
    };
  }

  /**
   * Compare two voice profiles
   */
  compareProfiles(profileId1: string, profileId2: string): VoiceProfileComparison {
    const profile1 = this.profiles.get(profileId1);
    const profile2 = this.profiles.get(profileId2);

    if (!profile1 || !profile2) {
      return {
        similarity: 0,
        differences: [
          {
            attribute: "existence",
            profile1Value: !!profile1,
            profile2Value: !!profile2,
          },
        ],
      };
    }

    const differences: VoiceProfileComparison["differences"] = [];

    // Compare key attributes
    const attributes: Array<keyof VoiceProfile> = [
      "role",
      "tempo",
      "authority",
      "tone",
      "pace",
      "ageRange",
      "gender",
      "accent",
    ];

    for (const attr of attributes) {
      if (profile1[attr] !== profile2[attr]) {
        differences.push({
          attribute: attr,
          profile1Value: profile1[attr],
          profile2Value: profile2[attr],
        });
      }
    }

    // Compare emotional range
    if (
      profile1.emotionalRange.min !== profile2.emotionalRange.min ||
      profile1.emotionalRange.max !== profile2.emotionalRange.max
    ) {
      differences.push({
        attribute: "emotionalRange",
        profile1Value: profile1.emotionalRange,
        profile2Value: profile2.emotionalRange,
      });
    }

    // Calculate similarity (1.0 = identical, 0.0 = completely different)
    const totalAttributes = attributes.length + 1; // +1 for emotional range
    const similarity = 1 - differences.length / totalAttributes;

    this.logger.info("voice_profile.compared", {
      profile1_id: profileId1,
      profile2_id: profileId2,
      similarity,
      difference_count: differences.length,
    });

    return {
      similarity,
      differences,
    };
  }

  /**
   * Validate voice profile assignment to scene
   */
  validateAssignment(
    profileId: string,
    sceneContext: {
      characterId?: string;
      emotionalIntensity?: number;
      sceneType?: string;
    }
  ): {
    valid: boolean;
    warnings: string[];
  } {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      return {
        valid: false,
        warnings: [`Profile ${profileId} not found`],
      };
    }

    const warnings: string[] = [];

    // Check character match
    if (sceneContext.characterId && profile.characterId) {
      if (profile.characterId !== sceneContext.characterId) {
        warnings.push("Voice profile assigned to different character");
      }
    }

    // Check emotional range
    if (sceneContext.emotionalIntensity !== undefined) {
      const { min, max } = profile.emotionalRange;
      if (sceneContext.emotionalIntensity < min || sceneContext.emotionalIntensity > max) {
        warnings.push(
          `Scene emotional intensity (${sceneContext.emotionalIntensity}) outside profile range (${min}-${max})`
        );
      }
    }

    // Check role appropriateness
    if (sceneContext.sceneType === "action" && profile.pace === "slow") {
      warnings.push("Slow-paced voice profile may not suit action scene");
    }

    const valid = warnings.length === 0;

    this.logger.info("voice_profile.assignment_validated", {
      profile_id: profileId,
      valid,
      warning_count: warnings.length,
    });

    return { valid, warnings };
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): VoiceProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get profiles by role
   */
  getProfilesByRole(role: VoiceProfile["role"]): VoiceProfile[] {
    return Array.from(this.profiles.values()).filter(p => p.role === role);
  }

  /**
   * Delete a voice profile
   */
  deleteProfile(profileId: string): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;

    // Remove character mapping if exists
    if (profile.characterId) {
      this.characterProfiles.delete(profile.characterId);
    }

    const deleted = this.profiles.delete(profileId);

    if (deleted) {
      this.logger.info("voice_profile.deleted", {
        profile_id: profileId,
      });
    }

    return deleted;
  }

  /**
   * Clone a voice profile
   */
  cloneProfile(profileId: string, newName: string): VoiceProfile {
    const original = this.profiles.get(profileId);
    if (!original) {
      throw new Error(`Voice profile ${profileId} not found`);
    }

    const cloned: VoiceProfile = {
      ...original,
      id: this.generateProfileId(newName),
      name: newName,
      characterId: undefined, // Don't copy character association
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    this.profiles.set(cloned.id, cloned);

    this.logger.info("voice_profile.cloned", {
      original_id: profileId,
      cloned_id: cloned.id,
      new_name: newName,
    });

    return cloned;
  }

  /**
   * Export voice profile to recording packet format
   */
  exportForRecording(profileId: string): {
    profileId: string;
    name: string;
    instructions: string;
    technicalSpecs: Record<string, unknown>;
  } {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Voice profile ${profileId} not found`);
    }

    // Build human-readable instructions
    const instructions = this.buildRecordingInstructions(profile);

    // Build technical specs
    const technicalSpecs = {
      tempo: profile.tempo,
      cadenceWPM: profile.cadenceWPM,
      emotionalRange: profile.emotionalRange,
      tone: profile.tone,
      pace: profile.pace,
      authority: profile.authority,
    };

    return {
      profileId: profile.id,
      name: profile.name,
      instructions,
      technicalSpecs,
    };
  }

  /**
   * Helper: Generate unique profile ID
   */
  private generateProfileId(name: string): string {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `voice_${slug}_${Date.now()}`;
  }

  /**
   * Helper: Calculate consistency score
   */
  private calculateConsistencyScore(profile: VoiceProfile, issueCount: number): number {
    let score = 1.0;

    // Penalize issues
    score -= issueCount * 0.2;

    // Bonus for completeness
    if (profile.pronunciationNotes.length > 0) score += 0.05;
    if (profile.allowedQuirks.length > 0) score += 0.05;
    if (profile.styleTags.length > 0) score += 0.05;
    if (profile.characterId) score += 0.05;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Helper: Build recording instructions from profile
   */
  private buildRecordingInstructions(profile: VoiceProfile): string {
    const parts: string[] = [];

    parts.push(`Voice Profile: ${profile.name}`);
    parts.push(`Role: ${profile.role}`);
    parts.push("");

    parts.push("Voice Characteristics:");
    parts.push(`- Tone: ${profile.tone}`);
    parts.push(`- Pace: ${profile.pace} (${profile.cadenceWPM} WPM)`);
    parts.push(`- Authority: ${(profile.authority * 100).toFixed(0)}%`);
    parts.push(
      `- Emotional Range: ${(profile.emotionalRange.min * 100).toFixed(0)}% - ${(profile.emotionalRange.max * 100).toFixed(0)}%`
    );
    parts.push("");

    if (profile.ageRange || profile.gender || profile.accent) {
      parts.push("Character Details:");
      if (profile.ageRange) parts.push(`- Age Range: ${profile.ageRange}`);
      if (profile.gender) parts.push(`- Gender: ${profile.gender}`);
      if (profile.accent) parts.push(`- Accent: ${profile.accent}`);
      parts.push("");
    }

    if (profile.styleTags.length > 0) {
      parts.push(`Style: ${profile.styleTags.join(", ")}`);
      parts.push("");
    }

    if (profile.allowedQuirks.length > 0) {
      parts.push("Allowed Quirks:");
      for (const quirk of profile.allowedQuirks) {
        parts.push(`- ${quirk}`);
      }
      parts.push("");
    }

    if (profile.forbiddenPatterns.length > 0) {
      parts.push("Avoid:");
      for (const pattern of profile.forbiddenPatterns) {
        parts.push(`- ${pattern}`);
      }
      parts.push("");
    }

    if (profile.pronunciationNotes.length > 0) {
      parts.push("Pronunciation Notes:");
      for (const note of profile.pronunciationNotes) {
        parts.push(`- ${note.word}: ${note.pronunciation}`);
      }
      parts.push("");
    }

    return parts.join("\n");
  }
}
