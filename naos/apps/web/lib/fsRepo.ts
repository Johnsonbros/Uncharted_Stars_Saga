import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "./env";

export type SceneRead = {
  projectId: string;
  sceneId: string;
  absPath: string;
  relPath: string;
  content: string;
  sha256: string;
};

function sha256(text: string) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export async function resolveScenePath(projectId: string, sceneId: string) {
  const safe = sceneId.replaceAll("..", "").replaceAll("\\", "/");
  const projectsRoot = path.resolve(process.cwd(), env.NAOS_PROJECTS_ROOT);
  const absPath = path.join(projectsRoot, projectId, "narrative", safe);
  const relPath = path.relative(projectsRoot, absPath);
  return { absPath, relPath };
}

export async function readScene(projectId: string, sceneId: string): Promise<SceneRead> {
  const { absPath, relPath } = await resolveScenePath(projectId, sceneId);
  const content = await fs.readFile(absPath, "utf8");
  return {
    projectId,
    sceneId,
    absPath,
    relPath,
    content,
    sha256: sha256(content)
  };
}

export async function writeScene(absPath: string, newContent: string) {
  await fs.writeFile(absPath, newContent, "utf8");
  return sha256(newContent);
}
