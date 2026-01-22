import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { audioMasters, audioSceneObjects, scenes } from "@/drizzle/schema";

export type AudioSceneIndexEntry = {
  sceneId: string;
  chapterId: string;
  sequenceOrder: number;
  canonStatus: string;
  audioSceneObjectId: string | null;
  narrationText: string | null;
  voiceProfileId: string | null;
};

export type AudioMasterRecord = {
  id: string;
  chapterId: string;
  storagePath: string;
  durationSeconds: number;
  fileSizeBytes: number;
  format: string;
  sampleRate: number;
};

export async function fetchAudioSceneIndex(
  projectId: string
): Promise<AudioSceneIndexEntry[]> {
  const rows = await db
    .select({
      sceneId: scenes.id,
      chapterId: scenes.chapterId,
      sequenceOrder: scenes.sequenceOrder,
      canonStatus: scenes.canonStatus,
      audioSceneObjectId: audioSceneObjects.id,
      narrationText: audioSceneObjects.narrationText,
      voiceProfileId: audioSceneObjects.voiceProfileId
    })
    .from(scenes)
    .leftJoin(audioSceneObjects, eq(audioSceneObjects.sceneId, scenes.id))
    .where(eq(scenes.projectId, projectId))
    .orderBy(scenes.sequenceOrder);

  return rows.map((row) => ({
    sceneId: row.sceneId,
    chapterId: row.chapterId,
    sequenceOrder: row.sequenceOrder,
    canonStatus: row.canonStatus,
    audioSceneObjectId: row.audioSceneObjectId ?? null,
    narrationText: row.narrationText ?? null,
    voiceProfileId: row.voiceProfileId ?? null
  }));
}

export async function fetchAudioMastersByChapter(
  chapterId: string
): Promise<AudioMasterRecord[]> {
  const rows = await db
    .select({
      id: audioMasters.id,
      chapterId: audioMasters.chapterId,
      storagePath: audioMasters.storagePath,
      durationSeconds: audioMasters.durationSeconds,
      fileSizeBytes: audioMasters.fileSizeBytes,
      format: audioMasters.format,
      sampleRate: audioMasters.sampleRate
    })
    .from(audioMasters)
    .where(eq(audioMasters.chapterId, chapterId));

  return rows.map((row) => ({
    id: row.id,
    chapterId: row.chapterId,
    storagePath: row.storagePath,
    durationSeconds: row.durationSeconds,
    fileSizeBytes: row.fileSizeBytes,
    format: row.format,
    sampleRate: row.sampleRate
  }));
}
