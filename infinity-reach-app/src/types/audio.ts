// Audio Engine Type Definitions
// Transforms text scenes into audio-ready performance artifacts

/**
 * Beat Marker - Indicates timing/emphasis points in narration
 */
export interface BeatMarker {
  id: string;
  position: number; // Character position in text
  type: 'pause' | 'emphasis' | 'breath' | 'speed_change' | 'emotional_shift';
  duration?: number; // In milliseconds for pauses
  intensity?: number; // 0-10 for emphasis/emotion
  note?: string;
}

/**
 * Emotional Envelope - Tracks emotional arc through a scene
 */
export interface EmotionalEnvelope {
  sceneId: string;
  segments: EmotionalSegment[];
  overallTone: string;
  dynamicRange: 'subtle' | 'moderate' | 'intense';
}

export interface EmotionalSegment {
  startPosition: number;
  endPosition: number;
  emotion: string; // tension, wonder, fear, joy, etc.
  intensity: number; // 0-10
  transition: 'sudden' | 'gradual' | 'sustained';
}

/**
 * Voice Profile - Character-specific voice characteristics
 */
export interface VoiceProfile {
  id: string;
  characterId: string;
  characterName: string;
  
  // Core vocal characteristics
  tempo: 'very_slow' | 'slow' | 'moderate' | 'fast' | 'very_fast';
  pitch: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  authority: number; // 0-10: hesitant to commanding
  warmth: number; // 0-10: cold to warm
  
  // Emotional range
  emotionalRange: 'restricted' | 'moderate' | 'expressive' | 'dramatic';
  defaultEmotion: string;
  
  // Speaking patterns
  allowedQuirks: string[]; // "stutters when nervous", "pauses before big words"
  forbiddenPatterns: string[]; // "never shouts", "avoids contractions"
  accentNotes?: string;
  breathingPattern: 'shallow' | 'normal' | 'deep';
  
  // Context-specific variations
  stressedVoice?: Partial<VoiceProfile>;
  relaxedVoice?: Partial<VoiceProfile>;
  
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Audio Scene Object - Complete audio-ready representation of a scene
 */
export interface AudioSceneObject {
  id: string;
  sceneId: string;
  version: number;
  
  // Core narrative
  narrationText: string; // Audio-optimized text
  originalText: string; // Original prose for reference
  
  // Audio metadata
  beatMarkers: BeatMarker[];
  emotionalEnvelope: EmotionalEnvelope;
  povCharacterId?: string;
  povVoiceProfile?: VoiceProfile;
  
  // Dialogue attribution
  dialogueSegments: DialogueSegment[];
  
  // Listener cognition safeguards
  clarityScore: number; // 0-10: how easy to follow
  cognitiveLoad: 'low' | 'moderate' | 'high';
  confusionRisks: ConfusionRisk[];
  
  // Performance notes
  directorNotes: string;
  estimatedDuration: number; // In seconds
  
  // Status
  status: 'draft' | 'review' | 'approved' | 'recorded';
  approvedBy?: string;
  approvedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dialogue Segment - Attributed dialogue with voice profile
 */
export interface DialogueSegment {
  id: string;
  startPosition: number;
  endPosition: number;
  characterId: string;
  characterName: string;
  text: string;
  voiceProfile: VoiceProfile;
  emotion: string;
  subtext?: string; // What they're really feeling/thinking
}

/**
 * Confusion Risk - Identifies potential listener comprehension issues
 */
export interface ConfusionRisk {
  id: string;
  type: 'pronoun_ambiguity' | 'timeline_jump' | 'location_unclear' | 'character_mix' | 'technical_term';
  position: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
  resolved: boolean;
}

/**
 * Recording Packet - Export format for audio production
 */
export interface RecordingPacket {
  id: string;
  chapterId: string;
  chapterTitle: string;
  audioScenes: AudioSceneObject[];
  
  // Chapter-level metadata
  totalEstimatedDuration: number;
  voiceProfilesUsed: VoiceProfile[];
  overallTone: string;
  productionNotes: string;
  
  // Technical specs
  targetFormat: 'professional' | 'podcast' | 'audiobook';
  qualityLevel: 'draft' | 'standard' | 'premium';
  
  // Export metadata
  exportedAt: Date;
  exportedBy: string;
  version: number;
}

/**
 * Audio Analysis Result - Automatic analysis of text for audio cues
 */
export interface AudioAnalysis {
  sceneId: string;
  analyzedAt: Date;
  
  // Detected patterns
  suggestedBeatMarkers: BeatMarker[];
  suggestedEmotionalEnvelope: EmotionalEnvelope;
  identifiedDialogue: DialogueSegment[];
  
  // Concerns
  confusionRisks: ConfusionRisk[];
  clarityScore: number;
  
  // Recommendations
  recommendations: string[];
  autoApplyable: boolean;
}

/**
 * Audio Settings - Global audio production preferences
 */
export interface AudioSettings {
  storyId: string;
  
  // Default preferences
  defaultNarrationVoice: string; // Character ID or "narrator"
  defaultPacing: 'slow' | 'moderate' | 'fast';
  pauseDuration: {
    comma: number; // milliseconds
    period: number;
    paragraph: number;
    sceneBreak: number;
  };
  
  // Style guidelines
  dialogueAttributionStyle: 'minimal' | 'standard' | 'explicit';
  technicalTermHandling: 'slow' | 'standard' | 'assume_familiar';
  emotionalIntensity: 'subtle' | 'moderate' | 'dramatic';
  
  // Production
  targetAudienceLevel: 'casual' | 'engaged' | 'scholar';
  includePartialTranscripts: boolean;
  
  updatedAt: Date;
}
