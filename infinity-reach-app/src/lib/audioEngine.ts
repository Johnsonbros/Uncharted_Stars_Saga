// Audio Engine - Transforms text scenes into audio-ready performance artifacts

import {
  AudioSceneObject,
  AudioAnalysis,
  BeatMarker,
  EmotionalEnvelope,
  EmotionalSegment,
  DialogueSegment,
  ConfusionRisk,
  VoiceProfile,
  RecordingPacket,
  AudioSettings,
} from '../types/audio';
import { Scene, Character } from '../types';

/**
 * Audio Engine Class
 * Analyzes text and generates audio-optimized representations
 */
export class AudioEngine {
  private settings: AudioSettings;

  constructor(storyId: string, settings?: Partial<AudioSettings>) {
    this.settings = {
      storyId,
      defaultNarrationVoice: 'narrator',
      defaultPacing: 'moderate',
      pauseDuration: {
        comma: 300,
        period: 500,
        paragraph: 1000,
        sceneBreak: 2000,
      },
      dialogueAttributionStyle: 'standard',
      technicalTermHandling: 'standard',
      emotionalIntensity: 'moderate',
      targetAudienceLevel: 'engaged',
      includePartialTranscripts: true,
      updatedAt: new Date(),
      ...settings,
    };
  }

  /**
   * Analyze a text scene for audio cues
   * Detects pacing, emotion, dialogue, and potential confusion points
   */
  analyzeScene(scene: Scene, characters: Character[]): AudioAnalysis {
    const text = scene.content;

    return {
      sceneId: scene.id,
      analyzedAt: new Date(),
      suggestedBeatMarkers: this.detectBeatMarkers(text),
      suggestedEmotionalEnvelope: this.analyzeEmotionalArc(text, scene),
      identifiedDialogue: this.extractDialogue(text, characters),
      confusionRisks: this.detectConfusionRisks(text, scene),
      clarityScore: this.calculateClarityScore(text, scene),
      recommendations: this.generateRecommendations(text, scene),
      autoApplyable: true,
    };
  }

  /**
   * Generate an Audio Scene Object from text
   * This is the core transformation function
   */
  generateAudioSceneObject(
    scene: Scene,
    characters: Character[],
    analysis?: AudioAnalysis
  ): AudioSceneObject {
    if (!analysis) {
      analysis = this.analyzeScene(scene, characters);
    }

    const narrationText = this.optimizeTextForNarration(scene.content);
    const povCharacter = characters.find(c => c.name === scene.pov);

    return {
      id: `audio-${scene.id}`,
      sceneId: scene.id,
      version: 1,
      narrationText,
      originalText: scene.content,
      beatMarkers: analysis.suggestedBeatMarkers,
      emotionalEnvelope: analysis.suggestedEmotionalEnvelope,
      povCharacterId: povCharacter?.id,
      povVoiceProfile: povCharacter ? this.generateVoiceProfile(povCharacter) : undefined,
      dialogueSegments: analysis.identifiedDialogue,
      clarityScore: analysis.clarityScore,
      cognitiveLoad: this.assessCognitiveLoad(scene.content),
      confusionRisks: analysis.confusionRisks,
      directorNotes: this.generateDirectorNotes(scene, analysis),
      estimatedDuration: this.estimateDuration(narrationText),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Detect beat markers (pauses, emphasis) from text structure
   */
  private detectBeatMarkers(text: string): BeatMarker[] {
    const markers: BeatMarker[] = [];
    let position = 0;

    // Detect paragraph breaks (longer pauses)
    const paragraphs = text.split('\n\n');
    paragraphs.forEach((para, index) => {
      if (index > 0) {
        markers.push({
          id: `beat-para-${index}`,
          position,
          type: 'pause',
          duration: this.settings.pauseDuration.paragraph,
          note: 'Paragraph break',
        });
      }
      position += para.length + 2;
    });

    // Detect ellipses (indicate trailing off or pause)
    const ellipsisRegex = /\.\.\./g;
    let match;
    while ((match = ellipsisRegex.exec(text)) !== null) {
      markers.push({
        id: `beat-ellipsis-${match.index}`,
        position: match.index,
        type: 'pause',
        duration: 800,
        note: 'Ellipsis - trailing thought',
      });
    }

    // Detect em dashes (sudden shifts or emphasis)
    const dashRegex = /—/g;
    while ((match = dashRegex.exec(text)) !== null) {
      markers.push({
        id: `beat-dash-${match.index}`,
        position: match.index,
        type: 'emphasis',
        intensity: 6,
        note: 'Em dash - shift or emphasis',
      });
    }

    // Detect italics (emphasis) - assuming *text* or _text_ format
    const italicsRegex = /[*_]([^*_]+)[*_]/g;
    while ((match = italicsRegex.exec(text)) !== null) {
      markers.push({
        id: `beat-italic-${match.index}`,
        position: match.index,
        type: 'emphasis',
        intensity: 7,
        note: 'Italicized text - emphasis',
      });
    }

    // Detect exclamation points (emotional intensity)
    const exclamationRegex = /!/g;
    while ((match = exclamationRegex.exec(text)) !== null) {
      markers.push({
        id: `beat-exclaim-${match.index}`,
        position: match.index,
        type: 'emotional_shift',
        intensity: 8,
        note: 'Exclamation - heightened emotion',
      });
    }

    return markers.sort((a, b) => a.position - b.position);
  }

  /**
   * Analyze emotional arc through the scene
   */
  private analyzeEmotionalArc(text: string, scene: Scene): EmotionalEnvelope {
    const segments: EmotionalSegment[] = [];
    
    // Simple heuristic: divide scene into thirds and analyze word choice
    const length = text.length;
    const segmentSize = Math.floor(length / 3);

    const emotionalWords = {
      tension: ['danger', 'fear', 'worried', 'anxious', 'threat', 'dark', 'shadow'],
      wonder: ['beautiful', 'amazing', 'discovered', 'marvel', 'stunning', 'vast'],
      action: ['ran', 'fought', 'chase', 'burst', 'exploded', 'fast', 'collision'],
      calm: ['peaceful', 'gentle', 'quiet', 'still', 'serene', 'soft'],
      sadness: ['loss', 'grief', 'tears', 'empty', 'alone', 'died'],
    };

    for (let i = 0; i < 3; i++) {
      const start = i * segmentSize;
      const end = i === 2 ? length : (i + 1) * segmentSize;
      const segment = text.substring(start, end).toLowerCase();

      // Count emotional word occurrences
      const emotionCounts: Record<string, number> = {};
      for (const [emotion, words] of Object.entries(emotionalWords)) {
        emotionCounts[emotion] = words.filter(word => segment.includes(word)).length;
      }

      // Find dominant emotion
      const dominantEmotion = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0];

      segments.push({
        startPosition: start,
        endPosition: end,
        emotion: dominantEmotion[0],
        intensity: Math.min(dominantEmotion[1] * 2, 10),
        transition: i === 0 ? 'sustained' : 'gradual',
      });
    }

    return {
      sceneId: scene.id,
      segments,
      overallTone: segments[0]?.emotion || 'neutral',
      dynamicRange: this.assessDynamicRange(segments),
    };
  }

  /**
   * Extract dialogue segments and attribute to characters
   */
  private extractDialogue(text: string, characters: Character[]): DialogueSegment[] {
    const segments: DialogueSegment[] = [];
    
    // Match dialogue in quotes
    const dialogueRegex = /"([^"]+)"/g;
    let match;
    let segmentId = 0;

    while ((match = dialogueRegex.exec(text)) !== null) {
      const dialogueText = match[1];
      const position = match.index;

      // Try to attribute to character (look for character name before dialogue)
      const contextBefore = text.substring(Math.max(0, position - 100), position);
      let characterFound: Character | undefined;

      for (const character of characters) {
        if (contextBefore.toLowerCase().includes(character.name.toLowerCase())) {
          characterFound = character;
          break;
        }
      }

      if (characterFound) {
        segments.push({
          id: `dialogue-${segmentId++}`,
          startPosition: position,
          endPosition: position + match[0].length,
          characterId: characterFound.id,
          characterName: characterFound.name,
          text: dialogueText,
          voiceProfile: this.generateVoiceProfile(characterFound),
          emotion: this.detectDialogueEmotion(dialogueText),
        });
      }
    }

    return segments;
  }

  /**
   * Detect potential confusion points for listeners
   */
  private detectConfusionRisks(text: string, scene: Scene): ConfusionRisk[] {
    const risks: ConfusionRisk[] = [];
    let riskId = 0;

    // Detect pronoun ambiguity
    const pronounRegex = /(he|she|they|it)\s+(said|thought|did|went)/gi;
    let match;
    while ((match = pronounRegex.exec(text)) !== null) {
      const context = text.substring(Math.max(0, match.index - 50), match.index);
      // Simple heuristic: if multiple potential referents nearby, flag it
      if ((context.match(/\b[A-Z][a-z]+\b/g) || []).length > 1) {
        risks.push({
          id: `risk-${riskId++}`,
          type: 'pronoun_ambiguity',
          position: match.index,
          severity: 'medium',
          description: `Pronoun "${match[1]}" may be ambiguous in audio`,
          suggestion: 'Consider using character name for clarity',
          resolved: false,
        });
      }
    }

    // Detect technical terms (words > 12 characters or uncommon)
    const technicalRegex = /\b[a-z]{13,}\b/gi;
    while ((match = technicalRegex.exec(text)) !== null) {
      risks.push({
        id: `risk-${riskId++}`,
        type: 'technical_term',
        position: match.index,
        severity: 'low',
        description: `Technical term "${match[0]}" may need slower pacing`,
        suggestion: 'Add beat marker for pronunciation clarity',
        resolved: false,
      });
    }

    return risks;
  }

  /**
   * Calculate scene clarity score (0-10)
   */
  private calculateClarityScore(text: string, scene: Scene): number {
    let score = 10;

    // Penalize for length (harder to follow long scenes)
    if (text.length > 5000) score -= 1;
    if (text.length > 10000) score -= 2;

    // Penalize for complex sentence structure
    const avgSentenceLength = text.length / (text.match(/[.!?]/g) || []).length;
    if (avgSentenceLength > 30) score -= 2;

    // Reward clear paragraph breaks
    const paragraphs = text.split('\n\n').length;
    if (paragraphs > 3) score += 1;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Generate recommendations for audio optimization
   */
  private generateRecommendations(text: string, scene: Scene): string[] {
    const recommendations: string[] = [];

    if (text.length > 8000) {
      recommendations.push('Consider splitting into multiple scenes for better listening flow');
    }

    const dialogueCount = (text.match(/"/g) || []).length / 2;
    if (dialogueCount > 20) {
      recommendations.push('Heavy dialogue scene - ensure clear character attribution');
    }

    const avgSentenceLength = text.length / (text.match(/[.!?]/g) || []).length;
    if (avgSentenceLength > 40) {
      recommendations.push('Long sentences detected - consider adding more pauses');
    }

    return recommendations;
  }

  /**
   * Optimize text for narration (minimal changes, preserve author voice)
   */
  private optimizeTextForNarration(text: string): string {
    let optimized = text;

    // Add subtle markers for audio cues (these would be stripped in final production)
    // For now, just return original text to preserve author's voice
    
    return optimized;
  }

  /**
   * Generate voice profile for a character
   */
  private generateVoiceProfile(character: Character): VoiceProfile {
    // Extract voice characteristics from character personality/description
    const personality = character.personality.toLowerCase();
    const background = character.background.toLowerCase();

    let tempo: VoiceProfile['tempo'] = 'moderate';
    if (personality.includes('nervous') || personality.includes('anxious')) tempo = 'fast';
    if (personality.includes('calm') || personality.includes('methodical')) tempo = 'slow';

    let authority = 5;
    if (background.includes('military') || background.includes('commander')) authority = 8;
    if (personality.includes('uncertain') || personality.includes('young')) authority = 3;

    let warmth = 5;
    if (personality.includes('compassionate') || personality.includes('kind')) warmth = 8;
    if (personality.includes('cold') || personality.includes('analytical')) warmth = 3;

    return {
      id: `voice-${character.id}`,
      characterId: character.id,
      characterName: character.name,
      tempo,
      pitch: 'moderate',
      authority,
      warmth,
      emotionalRange: 'moderate',
      defaultEmotion: 'neutral',
      allowedQuirks: [],
      forbiddenPatterns: [],
      breathingPattern: 'normal',
      notes: `Generated from character profile: ${character.name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate director notes for voice actors
   */
  private generateDirectorNotes(scene: Scene, analysis: AudioAnalysis): string {
    const notes: string[] = [];

    if (analysis.suggestedEmotionalEnvelope.segments.length > 0) {
      const dominantEmotion = analysis.suggestedEmotionalEnvelope.segments[0].emotion;
      notes.push(`Overall tone: ${dominantEmotion}`);
    }

    if (analysis.clarityScore < 7) {
      notes.push('Pay attention to pacing - complex scene');
    }

    if (analysis.identifiedDialogue.length > 10) {
      notes.push('Multiple character voices - ensure clear differentiation');
    }

    return notes.join('. ');
  }

  /**
   * Estimate narration duration in seconds
   */
  private estimateDuration(text: string): number {
    // Average reading speed: ~150 words per minute for narration
    // Add time for pauses
    const words = text.split(/\s+/).length;
    const baseDuration = (words / 150) * 60;

    // Add pause time
    const paragraphs = text.split('\n\n').length;
    const pauseTime = paragraphs * (this.settings.pauseDuration.paragraph / 1000);

    return Math.round(baseDuration + pauseTime);
  }

  /**
   * Assess cognitive load
   */
  private assessCognitiveLoad(text: string): 'low' | 'moderate' | 'high' {
    const length = text.length;
    const complexity = (text.match(/[,;:—]/g) || []).length;

    if (length > 8000 || complexity > 50) return 'high';
    if (length > 4000 || complexity > 25) return 'moderate';
    return 'low';
  }

  /**
   * Assess dynamic range of emotional segments
   */
  private assessDynamicRange(segments: EmotionalSegment[]): 'subtle' | 'moderate' | 'intense' {
    const intensities = segments.map(s => s.intensity);
    const range = Math.max(...intensities) - Math.min(...intensities);

    if (range > 6) return 'intense';
    if (range > 3) return 'moderate';
    return 'subtle';
  }

  /**
   * Detect emotion in dialogue
   */
  private detectDialogueEmotion(text: string): string {
    const lower = text.toLowerCase();
    
    if (text.includes('!')) return 'excited';
    if (text.includes('?')) return 'questioning';
    if (lower.includes('damn') || lower.includes('hell')) return 'angry';
    if (lower.includes('please') || lower.includes('sorry')) return 'apologetic';
    
    return 'neutral';
  }

  /**
   * Generate recording packet for a chapter
   */
  generateRecordingPacket(
    chapterId: string,
    chapterTitle: string,
    scenes: Scene[],
    characters: Character[]
  ): RecordingPacket {
    const audioScenes = scenes.map(scene => 
      this.generateAudioSceneObject(scene, characters)
    );

    const allVoiceProfiles = new Map<string, VoiceProfile>();
    audioScenes.forEach(scene => {
      scene.dialogueSegments.forEach(dialogue => {
        allVoiceProfiles.set(dialogue.characterId, dialogue.voiceProfile);
      });
    });

    const totalDuration = audioScenes.reduce((sum, scene) => sum + scene.estimatedDuration, 0);

    return {
      id: `packet-${chapterId}`,
      chapterId,
      chapterTitle,
      audioScenes,
      totalEstimatedDuration: totalDuration,
      voiceProfilesUsed: Array.from(allVoiceProfiles.values()),
      overallTone: audioScenes[0]?.emotionalEnvelope.overallTone || 'neutral',
      productionNotes: `Generated recording packet for ${scenes.length} scenes`,
      targetFormat: 'audiobook',
      qualityLevel: 'standard',
      exportedAt: new Date(),
      exportedBy: 'Audio Engine',
      version: 1,
    };
  }
}

// Export singleton instance
export const audioEngine = new AudioEngine('story-1');
