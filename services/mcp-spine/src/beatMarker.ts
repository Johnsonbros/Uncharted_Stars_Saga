import type { Logger } from "./types/loggerTypes.js";
import type { BeatMarker } from "./audioSceneObject.js";

/**
 * Beat marker application rule
 */
export interface BeatMarkerRule {
  type: BeatMarker["type"];
  pattern: RegExp;
  duration?: number;
  intensity?: number;
  priority: number; // Higher priority rules override lower priority
}

/**
 * Beat marker suggestion from analysis
 */
export interface BeatMarkerSuggestion {
  position: number;
  type: BeatMarker["type"];
  duration?: number;
  intensity?: number;
  reason: string;
  confidence: number; // 0.0-1.0
}

/**
 * Beat marker authoring configuration
 */
export interface BeatMarkerConfig {
  minPauseDuration: number; // ms
  maxPauseDuration: number; // ms
  defaultEmphasisIntensity: number; // 0.0-1.0
  enableAutoSuggestions: boolean;
}

/**
 * Beat Marker System
 *
 * Manages beat markers for audio scenes - pauses, emphasis, tone shifts, etc.
 * Provides both manual and automatic beat marker authoring.
 */
export class BeatMarkerSystem {
  private logger: Logger;
  private config: BeatMarkerConfig;
  private rules: BeatMarkerRule[];

  constructor(logger: Logger, config?: Partial<BeatMarkerConfig>) {
    this.logger = logger;
    this.config = {
      minPauseDuration: 200,
      maxPauseDuration: 2000,
      defaultEmphasisIntensity: 0.7,
      enableAutoSuggestions: true,
      ...config,
    };
    this.rules = this.initializeDefaultRules();

    this.logger.info("BeatMarkerSystem initialized", {
      min_pause: this.config.minPauseDuration,
      max_pause: this.config.maxPauseDuration,
      auto_suggestions: this.config.enableAutoSuggestions,
    });
  }

  /**
   * Apply beat markers to text based on rules
   */
  applyMarkers(text: string): BeatMarker[] {
    const markers: BeatMarker[] = [];

    // Apply each rule
    for (const rule of this.rules.sort((a, b) => b.priority - a.priority)) {
      const ruleMarkers = this.applyRule(text, rule);
      markers.push(...ruleMarkers);
    }

    // Sort by position and deduplicate
    const deduplicated = this.deduplicateMarkers(markers);

    this.logger.info("beat_markers.applied", {
      text_length: text.length,
      marker_count: deduplicated.length,
      rule_count: this.rules.length,
    });

    return deduplicated;
  }

  /**
   * Suggest beat markers based on text analysis
   */
  suggestMarkers(text: string): BeatMarkerSuggestion[] {
    if (!this.config.enableAutoSuggestions) {
      return [];
    }

    const suggestions: BeatMarkerSuggestion[] = [];

    // Detect sentence endings (natural pause points)
    suggestions.push(...this.detectSentenceEndings(text));

    // Detect emphasis opportunities
    suggestions.push(...this.detectEmphasisOpportunities(text));

    // Detect tone shifts
    suggestions.push(...this.detectToneShifts(text));

    // Detect breathing points in long sentences
    suggestions.push(...this.detectBreathingPoints(text));

    // Sort by confidence and position
    suggestions.sort((a, b) => b.confidence - a.confidence || a.position - b.position);

    this.logger.info("beat_markers.suggested", {
      text_length: text.length,
      suggestion_count: suggestions.length,
    });

    return suggestions;
  }

  /**
   * Validate beat markers for a text
   */
  validateMarkers(text: string, markers: BeatMarker[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const marker of markers) {
      // Check position bounds
      if (marker.position < 0 || marker.position > text.length) {
        errors.push(`Marker at position ${marker.position} is out of bounds`);
        continue;
      }

      // Validate pause duration
      if (marker.type === "pause") {
        if (!marker.duration) {
          errors.push(`Pause at position ${marker.position} missing duration`);
        } else if (marker.duration < this.config.minPauseDuration) {
          warnings.push(`Pause at ${marker.position} below minimum duration (${marker.duration}ms < ${this.config.minPauseDuration}ms)`);
        } else if (marker.duration > this.config.maxPauseDuration) {
          warnings.push(`Pause at ${marker.position} exceeds maximum duration (${marker.duration}ms > ${this.config.maxPauseDuration}ms)`);
        }
      }

      // Validate emphasis intensity
      if (marker.type === "emphasis") {
        if (!marker.intensity) {
          errors.push(`Emphasis at position ${marker.position} missing intensity`);
        } else if (marker.intensity < 0 || marker.intensity > 1) {
          errors.push(`Emphasis at ${marker.position} has invalid intensity (${marker.intensity})`);
        }
      }
    }

    // Check for excessive marker density
    const density = markers.length / (text.length / 100);
    if (density > 5) {
      warnings.push(`High marker density (${density.toFixed(1)} per 100 chars) may disrupt flow`);
    }

    // Check for marker clustering
    const clusters = this.detectClusters(markers);
    if (clusters.length > 0) {
      warnings.push(`Found ${clusters.length} marker clusters that may cause awkward pacing`);
    }

    const valid = errors.length === 0;

    this.logger.info("beat_markers.validated", {
      marker_count: markers.length,
      valid,
      error_count: errors.length,
      warning_count: warnings.length,
    });

    return { valid, errors, warnings };
  }

  /**
   * Optimize beat markers for natural flow
   */
  optimizeMarkers(text: string, markers: BeatMarker[]): BeatMarker[] {
    let optimized = [...markers];

    // Remove clustered markers (keep highest priority)
    optimized = this.removeClusters(optimized);

    // Ensure minimum spacing between markers
    optimized = this.enforceMinimumSpacing(optimized, 10);

    // Adjust pause durations based on context
    optimized = this.adjustPauseDurations(text, optimized);

    // Sort by position
    optimized.sort((a, b) => a.position - b.position);

    this.logger.info("beat_markers.optimized", {
      original_count: markers.length,
      optimized_count: optimized.length,
    });

    return optimized;
  }

  /**
   * Add a custom rule
   */
  addRule(rule: BeatMarkerRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);

    this.logger.info("beat_markers.rule_added", {
      type: rule.type,
      priority: rule.priority,
    });
  }

  /**
   * Remove a rule by index
   */
  removeRule(index: number): boolean {
    if (index < 0 || index >= this.rules.length) {
      return false;
    }

    this.rules.splice(index, 1);

    this.logger.info("beat_markers.rule_removed", {
      index,
      remaining_rules: this.rules.length,
    });

    return true;
  }

  /**
   * Get all rules
   */
  getRules(): BeatMarkerRule[] {
    return [...this.rules];
  }

  /**
   * Initialize default beat marker rules
   */
  private initializeDefaultRules(): BeatMarkerRule[] {
    return [
      // Sentence endings - medium pause
      {
        type: "pause",
        pattern: /[.!?]\s+/g,
        duration: 600,
        priority: 5,
      },
      // Commas - short pause
      {
        type: "pause",
        pattern: /,\s+/g,
        duration: 300,
        priority: 4,
      },
      // Em dashes - brief pause with tone shift
      {
        type: "pause",
        pattern: /—/g,
        duration: 400,
        priority: 6,
      },
      // Ellipsis - extended pause
      {
        type: "pause",
        pattern: /\.\.\./g,
        duration: 800,
        priority: 7,
      },
      // Exclamations - emphasis
      {
        type: "emphasis",
        pattern: /!/g,
        intensity: 0.8,
        priority: 6,
      },
      // Question marks - tone shift
      {
        type: "tone_shift",
        pattern: /\?/g,
        priority: 5,
      },
    ];
  }

  /**
   * Apply a single rule to text
   */
  private applyRule(text: string, rule: BeatMarkerRule): BeatMarker[] {
    const markers: BeatMarker[] = [];
    const matches = text.matchAll(rule.pattern);

    for (const match of matches) {
      if (match.index !== undefined) {
        markers.push({
          position: match.index,
          type: rule.type,
          duration: rule.duration,
          intensity: rule.intensity,
          metadata: { rule: "auto", priority: rule.priority },
        });
      }
    }

    return markers;
  }

  /**
   * Deduplicate markers at same position (keep highest priority)
   */
  private deduplicateMarkers(markers: BeatMarker[]): BeatMarker[] {
    const byPosition = new Map<number, BeatMarker>();

    for (const marker of markers) {
      const existing = byPosition.get(marker.position);

      if (!existing) {
        byPosition.set(marker.position, marker);
      } else {
        // Keep marker with higher priority
        const existingPriority = (existing.metadata?.priority as number) || 0;
        const newPriority = (marker.metadata?.priority as number) || 0;

        if (newPriority > existingPriority) {
          byPosition.set(marker.position, marker);
        }
      }
    }

    return Array.from(byPosition.values()).sort((a, b) => a.position - b.position);
  }

  /**
   * Detect sentence endings for pauses
   */
  private detectSentenceEndings(text: string): BeatMarkerSuggestion[] {
    const suggestions: BeatMarkerSuggestion[] = [];
    const pattern = /[.!?]\s+/g;
    const matches = text.matchAll(pattern);

    for (const match of matches) {
      if (match.index !== undefined) {
        suggestions.push({
          position: match.index,
          type: "pause",
          duration: 600,
          reason: "Sentence ending - natural pause point",
          confidence: 0.9,
        });
      }
    }

    return suggestions;
  }

  /**
   * Detect emphasis opportunities (all caps, italics markers, etc.)
   */
  private detectEmphasisOpportunities(text: string): BeatMarkerSuggestion[] {
    const suggestions: BeatMarkerSuggestion[] = [];

    // All caps words (excluding single letters)
    const capsPattern = /\b[A-Z]{2,}\b/g;
    const capsMatches = text.matchAll(capsPattern);

    for (const match of capsMatches) {
      if (match.index !== undefined) {
        suggestions.push({
          position: match.index,
          type: "emphasis",
          intensity: 0.8,
          reason: "All caps word suggests emphasis",
          confidence: 0.7,
        });
      }
    }

    return suggestions;
  }

  /**
   * Detect tone shifts (questions, interruptions)
   */
  private detectToneShifts(text: string): BeatMarkerSuggestion[] {
    const suggestions: BeatMarkerSuggestion[] = [];

    // Questions - tone shift
    const questionPattern = /\?/g;
    const questionMatches = text.matchAll(questionPattern);

    for (const match of questionMatches) {
      if (match.index !== undefined) {
        suggestions.push({
          position: match.index,
          type: "tone_shift",
          reason: "Question mark indicates tone shift",
          confidence: 0.8,
        });
      }
    }

    // Em dashes - interruption/tone shift
    const dashPattern = /—/g;
    const dashMatches = text.matchAll(dashPattern);

    for (const match of dashMatches) {
      if (match.index !== undefined) {
        suggestions.push({
          position: match.index,
          type: "tone_shift",
          reason: "Em dash indicates interruption or shift",
          confidence: 0.75,
        });
      }
    }

    return suggestions;
  }

  /**
   * Detect breathing points in long sentences
   */
  private detectBreathingPoints(text: string): BeatMarkerSuggestion[] {
    const suggestions: BeatMarkerSuggestion[] = [];
    const sentences = text.split(/[.!?]\s+/);

    let position = 0;
    for (const sentence of sentences) {
      // If sentence is long (>150 chars), suggest breath after commas
      if (sentence.length > 150) {
        const commaPattern = /,\s+/g;
        const matches = sentence.matchAll(commaPattern);

        for (const match of matches) {
          if (match.index !== undefined) {
            suggestions.push({
              position: position + match.index,
              type: "breath",
              reason: "Long sentence - breathing point at comma",
              confidence: 0.6,
            });
          }
        }
      }

      position += sentence.length + 2; // +2 for sentence ending and space
    }

    return suggestions;
  }

  /**
   * Detect marker clusters (multiple markers within 20 chars)
   */
  private detectClusters(markers: BeatMarker[]): number[] {
    const clusters: number[] = [];
    const sorted = [...markers].sort((a, b) => a.position - b.position);

    for (let i = 1; i < sorted.length; i++) {
      const distance = sorted[i].position - sorted[i - 1].position;
      if (distance < 20) {
        clusters.push(i);
      }
    }

    return clusters;
  }

  /**
   * Remove clustered markers
   */
  private removeClusters(markers: BeatMarker[]): BeatMarker[] {
    const sorted = [...markers].sort((a, b) => a.position - b.position);
    const filtered: BeatMarker[] = [];

    for (let i = 0; i < sorted.length; i++) {
      // Check if this marker is too close to the previous one
      if (i === 0 || sorted[i].position - filtered[filtered.length - 1].position >= 20) {
        filtered.push(sorted[i]);
      }
    }

    return filtered;
  }

  /**
   * Enforce minimum spacing between markers
   */
  private enforceMinimumSpacing(markers: BeatMarker[], minSpacing: number): BeatMarker[] {
    const sorted = [...markers].sort((a, b) => a.position - b.position);
    const spaced: BeatMarker[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i === 0 || sorted[i].position - spaced[spaced.length - 1].position >= minSpacing) {
        spaced.push(sorted[i]);
      }
    }

    return spaced;
  }

  /**
   * Adjust pause durations based on context
   */
  private adjustPauseDurations(text: string, markers: BeatMarker[]): BeatMarker[] {
    return markers.map(marker => {
      if (marker.type !== "pause" || !marker.duration) {
        return marker;
      }

      // Adjust based on surrounding text
      const beforeText = text.substring(Math.max(0, marker.position - 50), marker.position);
      const afterText = text.substring(marker.position, Math.min(text.length, marker.position + 50));

      let adjustedDuration = marker.duration;

      // Longer pause after question
      if (beforeText.includes("?")) {
        adjustedDuration *= 1.2;
      }

      // Shorter pause in rapid dialogue
      if (beforeText.includes('"') && afterText.includes('"')) {
        adjustedDuration *= 0.8;
      }

      // Clamp to configured limits
      adjustedDuration = Math.max(
        this.config.minPauseDuration,
        Math.min(this.config.maxPauseDuration, adjustedDuration)
      );

      return {
        ...marker,
        duration: Math.round(adjustedDuration),
      };
    });
  }
}
