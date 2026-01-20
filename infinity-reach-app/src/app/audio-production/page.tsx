'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { dataStore } from '@/lib/dataStore';
import { audioEngine } from '@/lib/audioEngine';
import { AudioSceneObject, RecordingPacket } from '@/types/audio';
import { Scene } from '@/types';

export default function AudioProductionPage() {
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [audioScene, setAudioScene] = useState<AudioSceneObject | null>(null);
  const [recordingPacket, setRecordingPacket] = useState<RecordingPacket | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const chapters = dataStore.getAllChapters();
  const characters = dataStore.getAllCharacters();
  const scenes = selectedChapter 
    ? dataStore.getScenesByChapter(selectedChapter)
    : [];

  const handleAnalyzeScene = () => {
    if (!selectedScene) return;

    const scene = dataStore.getScene(selectedScene);
    if (!scene) return;

    const analysis = audioEngine.analyzeScene(scene, characters);
    const audioSceneObj = audioEngine.generateAudioSceneObject(scene, characters, analysis);
    
    setAudioScene(audioSceneObj);
    setShowAnalysis(true);
  };

  const handleGenerateRecordingPacket = () => {
    if (!selectedChapter) return;

    const chapter = dataStore.getChapter(selectedChapter);
    if (!chapter) return;

    const chapterScenes = dataStore.getScenesByChapter(selectedChapter);
    const packet = audioEngine.generateRecordingPacket(
      chapter.id,
      chapter.title,
      chapterScenes,
      characters
    );

    setRecordingPacket(packet);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audio Production</h1>
          <p className="text-gray-600">
            Transform text scenes into audio-ready performance artifacts
          </p>
        </div>

        {/* Scene Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Scene for Audio Analysis</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  setSelectedScene('');
                  setAudioScene(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a chapter...</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scene
              </label>
              <select
                value={selectedScene}
                onChange={(e) => setSelectedScene(e.target.value)}
                disabled={!selectedChapter}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select a scene...</option>
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyzeScene}
            disabled={!selectedScene}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            🎙️ Analyze for Audio
          </button>
        </div>

        {/* Audio Scene Analysis Results */}
        {audioScene && showAnalysis && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Audio Scene Object</h2>

            {/* Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">Estimated Duration</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(audioScene.estimatedDuration)}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">Clarity Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {audioScene.clarityScore}/10
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">Cognitive Load</div>
                <div className="text-2xl font-bold text-purple-600 capitalize">
                  {audioScene.cognitiveLoad}
                </div>
              </div>
            </div>

            {/* Beat Markers */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Beat Markers</h3>
              <div className="space-y-2">
                {audioScene.beatMarkers.slice(0, 10).map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        marker.type === 'pause' ? 'bg-blue-100 text-blue-700' :
                        marker.type === 'emphasis' ? 'bg-yellow-100 text-yellow-700' :
                        marker.type === 'emotional_shift' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {marker.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        Position: {marker.position}
                      </span>
                      {marker.duration && (
                        <span className="text-sm text-gray-500">
                          {marker.duration}ms
                        </span>
                      )}
                      {marker.intensity && (
                        <span className="text-sm text-gray-500">
                          Intensity: {marker.intensity}/10
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {marker.note}
                    </div>
                  </div>
                ))}
                {audioScene.beatMarkers.length > 10 && (
                  <div className="text-sm text-gray-500 text-center">
                    ... and {audioScene.beatMarkers.length - 10} more markers
                  </div>
                )}
              </div>
            </div>

            {/* Emotional Envelope */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Emotional Arc</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Overall Tone: </span>
                  <span className="font-medium capitalize">
                    {audioScene.emotionalEnvelope.overallTone}
                  </span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-sm text-gray-600">Dynamic Range: </span>
                  <span className="font-medium capitalize">
                    {audioScene.emotionalEnvelope.dynamicRange}
                  </span>
                </div>
                <div className="space-y-2 mt-3">
                  {audioScene.emotionalEnvelope.segments.map((segment, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 w-20">
                        Segment {index + 1}
                      </span>
                      <div className="flex-1 bg-white rounded-full h-6 relative overflow-hidden">
                        <div
                          className={`h-full ${
                            segment.emotion === 'tension' ? 'bg-red-400' :
                            segment.emotion === 'wonder' ? 'bg-blue-400' :
                            segment.emotion === 'action' ? 'bg-orange-400' :
                            segment.emotion === 'calm' ? 'bg-green-400' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${segment.intensity * 10}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {segment.emotion} ({segment.intensity}/10)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dialogue Segments */}
            {audioScene.dialogueSegments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Dialogue ({audioScene.dialogueSegments.length} segments)
                </h3>
                <div className="space-y-3">
                  {audioScene.dialogueSegments.slice(0, 5).map((dialogue) => (
                    <div
                      key={dialogue.id}
                      className="p-3 bg-indigo-50 rounded-md border-l-4 border-indigo-400"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-indigo-900">
                          {dialogue.characterName}
                        </span>
                        <span className="text-sm text-indigo-600 capitalize">
                          {dialogue.emotion}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 italic">
                        "{dialogue.text}"
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Tempo: {dialogue.voiceProfile.tempo} | Authority: {dialogue.voiceProfile.authority}/10
                      </div>
                    </div>
                  ))}
                  {audioScene.dialogueSegments.length > 5 && (
                    <div className="text-sm text-gray-500 text-center">
                      ... and {audioScene.dialogueSegments.length - 5} more dialogue segments
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confusion Risks */}
            {audioScene.confusionRisks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  ⚠️ Confusion Risks ({audioScene.confusionRisks.length})
                </h3>
                <div className="space-y-2">
                  {audioScene.confusionRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className={`p-3 rounded-md border-l-4 ${
                        risk.severity === 'high' ? 'bg-red-50 border-red-400' :
                        risk.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {risk.type.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                          risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        {risk.description}
                      </div>
                      {risk.suggestion && (
                        <div className="text-xs text-gray-600 italic">
                          Suggestion: {risk.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Director Notes */}
            <div className="bg-amber-50 p-4 rounded-md border-l-4 border-amber-400">
              <h3 className="text-lg font-semibold mb-2">🎬 Director Notes</h3>
              <p className="text-gray-700">{audioScene.directorNotes}</p>
            </div>
          </div>
        )}

        {/* Recording Packet Generation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generate Recording Packet</h2>
          <p className="text-gray-600 mb-4">
            Generate a complete recording packet for an entire chapter, ready for audio production.
          </p>

          <button
            onClick={handleGenerateRecordingPacket}
            disabled={!selectedChapter}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            📦 Generate Recording Packet
          </button>
        </div>

        {/* Recording Packet Display */}
        {recordingPacket && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recording Packet</h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">Total Duration</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatDuration(recordingPacket.totalEstimatedDuration)}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">Scenes</div>
                <div className="text-xl font-bold text-green-600">
                  {recordingPacket.audioScenes.length}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">Voice Profiles</div>
                <div className="text-xl font-bold text-purple-600">
                  {recordingPacket.voiceProfilesUsed.length}
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">Overall Tone</div>
                <div className="text-xl font-bold text-amber-600 capitalize">
                  {recordingPacket.overallTone}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Voice Profiles Used</h3>
              <div className="grid grid-cols-2 gap-3">
                {recordingPacket.voiceProfilesUsed.map((profile) => (
                  <div key={profile.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">{profile.characterName}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Tempo: {profile.tempo} | Authority: {profile.authority}/10 | Warmth: {profile.warmth}/10
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Production Notes</h3>
              <p className="text-gray-700">{recordingPacket.productionNotes}</p>
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                <span>Format: {recordingPacket.targetFormat}</span>
                <span>•</span>
                <span>Quality: {recordingPacket.qualityLevel}</span>
                <span>•</span>
                <span>Version: {recordingPacket.version}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
