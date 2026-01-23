/**
 * Audio Storage Integration
 *
 * Handles audio file storage and signed URL generation for streaming.
 * Designed to work with Replit Object Storage initially, with a clear
 * upgrade path to external CDN (CloudFront, Cloudflare) if needed.
 */

import { createHmac } from "crypto";

import { env } from "@/lib/env";

// Signed URL expiration time (1 hour)
const SIGNED_URL_EXPIRY_SECONDS = 3600;

// Audio storage path convention: audio/{chapterSlug}/master.{format}
const AUDIO_PATH_PREFIX = "audio";

export interface AudioFileInfo {
  storagePath: string;
  format: string;
  durationSeconds: number;
  fileSizeBytes?: number;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
  durationSeconds: number;
}

/**
 * Generate storage path for a chapter's audio file
 */
export function getAudioStoragePath(chapterSlug: string, format = "mp3"): string {
  return `${AUDIO_PATH_PREFIX}/${chapterSlug}/master.${format}`;
}

/**
 * Generate a signed URL for streaming audio
 *
 * For Replit Object Storage, we use a simple HMAC-based signature.
 * In production with CloudFront, this would use CloudFront signed URLs.
 */
export function generateSignedUrl(
  storagePath: string,
  durationSeconds: number,
  expirySeconds = SIGNED_URL_EXPIRY_SECONDS
): SignedUrlResult {
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);
  const expiresTimestamp = Math.floor(expiresAt.getTime() / 1000);

  // Create signature using HMAC-SHA256
  const dataToSign = `${storagePath}:${expiresTimestamp}`;
  const signature = createHmac("sha256", env.SESSION_SECRET)
    .update(dataToSign)
    .digest("hex")
    .slice(0, 32);

  // Build signed URL
  const baseUrl = getStorageBaseUrl();
  const url = `${baseUrl}/api/audio/stream?path=${encodeURIComponent(storagePath)}&expires=${expiresTimestamp}&sig=${signature}`;

  return {
    url,
    expiresAt,
    durationSeconds
  };
}

/**
 * Verify a signed URL signature
 */
export function verifySignedUrl(
  storagePath: string,
  expiresTimestamp: number,
  signature: string
): boolean {
  // Check expiration
  if (Date.now() > expiresTimestamp * 1000) {
    return false;
  }

  // Verify signature
  const dataToSign = `${storagePath}:${expiresTimestamp}`;
  const expectedSignature = createHmac("sha256", env.SESSION_SECRET)
    .update(dataToSign)
    .digest("hex")
    .slice(0, 32);

  return signature === expectedSignature;
}

/**
 * Get the base URL for storage
 */
function getStorageBaseUrl(): string {
  return env.APP_URL;
}

/**
 * Generate signed URL for a chapter
 */
export async function getChapterAudioUrl(
  chapterSlug: string,
  durationSeconds: number
): Promise<SignedUrlResult> {
  const storagePath = getAudioStoragePath(chapterSlug);
  return generateSignedUrl(storagePath, durationSeconds);
}

/**
 * Read audio file from storage (placeholder for Replit Object Storage)
 *
 * In production, this would use:
 * - Replit Object Storage SDK
 * - Or S3 SDK for AWS
 * - Or R2 for Cloudflare
 */
export async function readAudioFile(storagePath: string): Promise<ReadableStream | null> {
  // Check if we're in development mode with local files
  if (process.env.NODE_ENV === "development") {
    // Try to read from local public folder as fallback
    const localPath = `./public/${storagePath}`;
    try {
      const fs = await import("fs");
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        return new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
          }
        });
      }
    } catch {
      // File doesn't exist locally
    }
  }

  // Replit Object Storage integration
  if (env.REPLIT_OBJECT_STORAGE_BUCKET) {
    try {
      // Dynamically import Replit storage if available
      // const { storage } = await import("@replit/object-storage");
      // const file = await storage.get(storagePath);
      // return file?.stream();

      // For now, return null - integrate when deploying to Replit
      console.log(`[Audio] Would fetch from Replit storage: ${storagePath}`);
    } catch (error) {
      console.error("[Audio] Storage read error:", error);
    }
  }

  return null;
}

/**
 * Check if an audio file exists in storage
 */
export async function audioFileExists(storagePath: string): Promise<boolean> {
  // Development mode - check local public folder
  if (process.env.NODE_ENV === "development") {
    try {
      const fs = await import("fs");
      return fs.existsSync(`./public/${storagePath}`);
    } catch {
      return false;
    }
  }

  // Production - check Replit Object Storage
  if (env.REPLIT_OBJECT_STORAGE_BUCKET) {
    try {
      // const { storage } = await import("@replit/object-storage");
      // const exists = await storage.exists(storagePath);
      // return exists;
      return false;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get content type for audio format
 */
export function getAudioContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    ogg: "audio/ogg",
    wav: "audio/wav",
    flac: "audio/flac"
  };

  return contentTypes[format.toLowerCase()] || "audio/mpeg";
}
