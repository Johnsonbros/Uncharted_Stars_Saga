import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventDependencies, events, knowledgeStates, promises } from "@/drizzle/schema";
import {
  checkContinuity,
  createEvent,
  transitionCanonStatus,
  transitionPromiseStatus,
  updateEvent,
  validateCanonGate
} from "./engine";
import {
  type Event,
  type EventInput,
  type KnowledgeEffect,
  type KnowledgeState,
  type PromiseInput,
  type PromiseRecord,
  type PromiseStatus,
  EventSchema,
  KnowledgeEffectSchema,
  KnowledgeStateSchema,
  PromiseInputSchema,
  PromiseRecordSchema
} from "./models";

type EventRow = typeof events.$inferSelect;
type KnowledgeRow = typeof knowledgeStates.$inferSelect;
type PromiseRow = typeof promises.$inferSelect;

function mapKnowledgeRow(row: KnowledgeRow): KnowledgeEffect {
  return KnowledgeEffectSchema.parse({
    characterId: row.characterId,
    learnedAt: row.learnedAt,
    certainty: row.certainty,
    source: row.source
  });
}

function mapEventRow(
  row: EventRow,
  dependencies: string[],
  knowledgeEffects: KnowledgeEffect[]
): Event {
  return EventSchema.parse({
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    participants: row.participants ?? [],
    location: row.location ?? undefined,
    description: row.description,
    dependencies,
    impacts: (row.impacts ?? []) as Event["impacts"],
    knowledgeEffects,
    canonStatus: row.canonStatus
  });
}

function mapPromiseRow(row: PromiseRow): PromiseRecord {
  return PromiseRecordSchema.parse({
    id: row.id,
    type: row.type,
    establishedIn: row.establishedInScene,
    description: row.description,
    status: row.status,
    fulfilledIn: row.fulfilledInScene ?? undefined
  });
}

async function fetchDependenciesByEventId(eventIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (eventIds.length === 0) {
    return map;
  }

  const rows = await db
    .select()
    .from(eventDependencies)
    .where(inArray(eventDependencies.eventId, eventIds));

  for (const row of rows) {
    const list = map.get(row.eventId) ?? [];
    list.push(row.dependsOnEventId);
    map.set(row.eventId, list);
  }

  return map;
}

async function fetchKnowledgeEffectsByEventId(
  projectId: string,
  eventIds: string[]
): Promise<Map<string, KnowledgeEffect[]>> {
  const map = new Map<string, KnowledgeEffect[]>();
  if (eventIds.length === 0) {
    return map;
  }

  const rows = await db
    .select()
    .from(knowledgeStates)
    .where(and(eq(knowledgeStates.projectId, projectId), inArray(knowledgeStates.eventId, eventIds)));

  for (const row of rows) {
    const list = map.get(row.eventId) ?? [];
    list.push(mapKnowledgeRow(row));
    map.set(row.eventId, list);
  }

  return map;
}

async function assertDependenciesExist(dependencyIds: string[]) {
  if (dependencyIds.length === 0) {
    return;
  }

  const rows = await db
    .select({ id: events.id, canonStatus: events.canonStatus })
    .from(events)
    .where(inArray(events.id, dependencyIds));

  const found = new Set(rows.map((row) => row.id));
  const missing = dependencyIds.filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw new Error(`Missing dependency events: ${missing.join(", ")}`);
  }

  const canonDeps = rows.filter((row) => row.canonStatus === "canon").map((row) => row.id);
  if (canonDeps.length > 0) {
    throw new Error(`Dependencies cannot reference canonical events: ${canonDeps.join(", ")}`);
  }
}

function assertKnowledgeTemporalConstraints(event: Readonly<Event>) {
  for (const effect of event.knowledgeEffects) {
    const learnedAt = effect.learnedAt ?? event.timestamp;
    if (learnedAt < event.timestamp) {
      throw new Error(
        `Knowledge for character ${effect.characterId} cannot be learned before event ${event.id} (${learnedAt.toISOString()} < ${event.timestamp.toISOString()}).`
      );
    }
  }
}

function assertContinuity(events: Readonly<Event>[]) {
  const report = checkContinuity(events);
  const issues = [
    ...report.dependencyIssues.map(
      (issue) =>
        `Event ${issue.eventId} missing dependencies: ${issue.missingDependencies.join(", ")}`
    ),
    ...report.cycleIssues.map((issue) => `Dependency cycle detected: ${issue.cycle.join(" -> ")}`),
    ...report.timestampIssues
  ];
  if (issues.length > 0) {
    throw new Error(`Continuity check failed:\n${issues.join("\n")}`);
  }
}

export async function fetchProjectEvents(projectId: string): Promise<Event[]> {
  const rows = await db.select().from(events).where(eq(events.projectId, projectId));
  const dependencyMap = await fetchDependenciesByEventId(rows.map((row) => row.id));
  const knowledgeMap = await fetchKnowledgeEffectsByEventId(
    projectId,
    rows.map((row) => row.id)
  );
  return rows.map((row) =>
    mapEventRow(row, dependencyMap.get(row.id) ?? [], knowledgeMap.get(row.id) ?? [])
  );
}

export async function fetchEventById(projectId: string, eventId: string): Promise<Event | null> {
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.projectId, projectId), eq(events.id, eventId)));
  if (rows.length === 0) {
    return null;
  }
  const dependencyMap = await fetchDependenciesByEventId([eventId]);
  const knowledgeMap = await fetchKnowledgeEffectsByEventId(projectId, [eventId]);
  return mapEventRow(
    rows[0],
    dependencyMap.get(eventId) ?? [],
    knowledgeMap.get(eventId) ?? []
  );
}

export async function fetchPromises(projectId: string): Promise<PromiseRecord[]> {
  const rows = await db.select().from(promises).where(eq(promises.projectId, projectId));
  return rows.map(mapPromiseRow);
}

export async function fetchKnowledgeStates(
  projectId: string,
  eventIds: string[]
): Promise<KnowledgeState[]> {
  if (eventIds.length === 0) {
    return [];
  }
  const rows = await db
    .select()
    .from(knowledgeStates)
    .where(and(eq(knowledgeStates.projectId, projectId), inArray(knowledgeStates.eventId, eventIds)));
  return rows.map((row) =>
    KnowledgeStateSchema.parse({
      characterId: row.characterId,
      eventId: row.eventId,
      learnedAt: row.learnedAt,
      certainty: row.certainty,
      source: row.source
    })
  );
}

export async function createEventRecord(
  projectId: string,
  input: EventInput
): Promise<Readonly<Event>> {
  const event = createEvent(input);
  const dependencies = [...new Set(event.dependencies)];

  if (dependencies.includes(event.id)) {
    throw new Error("Event cannot depend on itself.");
  }

  await assertDependenciesExist(dependencies);
  assertKnowledgeTemporalConstraints(event);

  const existingEvents = await fetchProjectEvents(projectId);
  assertContinuity([...existingEvents, event]);

  await db.transaction(async (tx) => {
    await tx
      .insert(events)
      .values({
        id: event.id,
        projectId,
        timestamp: event.timestamp,
        type: event.type,
        participants: event.participants,
        location: event.location ?? null,
        description: event.description,
        impacts: event.impacts,
        canonStatus: event.canonStatus
      })
      .returning();

    if (dependencies.length > 0) {
      await tx.insert(eventDependencies).values(
        dependencies.map((dependencyId) => ({
          eventId: event.id,
          dependsOnEventId: dependencyId
        }))
      );
    }

    if (event.knowledgeEffects.length > 0) {
      await tx.insert(knowledgeStates).values(
        event.knowledgeEffects.map((effect) => ({
          projectId,
          characterId: effect.characterId,
          eventId: event.id,
          learnedAt: effect.learnedAt ?? event.timestamp,
          certainty: effect.certainty,
          source: effect.source,
          canonStatus: event.canonStatus
        }))
      );
    }
  });

  return Object.freeze({ ...event, dependencies });
}

export type EventUpdateInput = Partial<
  Pick<
    Event,
    "timestamp" | "type" | "participants" | "location" | "description" | "dependencies" | "impacts"
  > & {
    knowledgeEffects: Event["knowledgeEffects"];
  }
>;

export async function updateEventRecord(
  projectId: string,
  eventId: string,
  updates: EventUpdateInput
): Promise<Readonly<Event>> {
  const current = await fetchEventById(projectId, eventId);
  if (!current) {
    throw new Error(`Event ${eventId} not found.`);
  }

  const updated = updateEvent(current, updates);
  const dependencies = [...new Set(updated.dependencies)];

  if (dependencies.includes(updated.id)) {
    throw new Error("Event cannot depend on itself.");
  }

  await assertDependenciesExist(dependencies);
  assertKnowledgeTemporalConstraints(updated);

  const existingEvents = await fetchProjectEvents(projectId);
  const mergedEvents = existingEvents.map((event) =>
    event.id === updated.id ? updated : event
  );
  assertContinuity(mergedEvents);

  await db.transaction(async (tx) => {
    await tx
      .update(events)
      .set({
        timestamp: updated.timestamp,
        type: updated.type,
        participants: updated.participants,
        location: updated.location ?? null,
        description: updated.description,
        impacts: updated.impacts,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));

    if ("dependencies" in updates) {
      await tx.delete(eventDependencies).where(eq(eventDependencies.eventId, eventId));
      if (dependencies.length > 0) {
        await tx.insert(eventDependencies).values(
          dependencies.map((dependencyId) => ({
            eventId,
            dependsOnEventId: dependencyId
          }))
        );
      }
    }

    if ("knowledgeEffects" in updates) {
      await tx.delete(knowledgeStates).where(eq(knowledgeStates.eventId, eventId));
      if (updated.knowledgeEffects.length > 0) {
        await tx.insert(knowledgeStates).values(
          updated.knowledgeEffects.map((effect) => ({
            projectId,
            characterId: effect.characterId,
            eventId,
            learnedAt: effect.learnedAt ?? updated.timestamp,
            certainty: effect.certainty,
            source: effect.source,
            canonStatus: updated.canonStatus
          }))
        );
      }
    }
  });

  return Object.freeze({ ...updated, dependencies });
}

export async function updateEventCanonStatus(
  projectId: string,
  eventId: string,
  nextStatus: Event["canonStatus"]
): Promise<Readonly<Event>> {
  const current = await fetchEventById(projectId, eventId);
  if (!current) {
    throw new Error(`Event ${eventId} not found.`);
  }

  const updated = transitionCanonStatus(current, nextStatus);
  if (nextStatus === "canon") {
    const projectEvents = await fetchProjectEvents(projectId);
    const mergedEvents = projectEvents.map((event) =>
      event.id === updated.id ? updated : event
    );
    const promiseRecords = await fetchPromises(projectId);
    const report = validateCanonGate(mergedEvents, promiseRecords);
    if (!report.passed) {
      throw new Error("Canon gate validation failed for this change.");
    }
  }

  await db
    .update(events)
    .set({ canonStatus: updated.canonStatus, updatedAt: new Date() })
    .where(eq(events.id, eventId));

  if (nextStatus === "canon") {
    await db
      .update(knowledgeStates)
      .set({ canonStatus: updated.canonStatus, updatedAt: new Date() })
      .where(eq(knowledgeStates.eventId, eventId));
  }

  return Object.freeze({ ...updated });
}

export async function createPromiseRecord(
  projectId: string,
  input: PromiseInput
): Promise<PromiseRecord> {
  const parsed = PromiseInputSchema.parse(input);
  if (parsed.status === "fulfilled" && !parsed.fulfilledIn) {
    throw new Error("Fulfilled promises must include fulfilledIn.");
  }
  if (parsed.status !== "fulfilled" && parsed.fulfilledIn) {
    throw new Error("Only fulfilled promises may set fulfilledIn.");
  }

  const [row] = await db
    .insert(promises)
    .values({
      projectId,
      type: parsed.type,
      establishedInScene: parsed.establishedIn,
      description: parsed.description,
      status: parsed.status ?? "pending",
      fulfilledInScene: parsed.fulfilledIn ?? null,
      canonStatus: "draft"
    })
    .returning();

  return mapPromiseRow(row);
}

export async function updatePromiseStatusRecord(
  projectId: string,
  promiseId: string,
  nextStatus: PromiseStatus,
  fulfilledIn?: string
): Promise<PromiseRecord> {
  const rows = await db
    .select()
    .from(promises)
    .where(and(eq(promises.projectId, projectId), eq(promises.id, promiseId)));
  if (rows.length === 0) {
    throw new Error(`Promise ${promiseId} not found.`);
  }
  const current = mapPromiseRow(rows[0]);
  const updated = transitionPromiseStatus(current, nextStatus);

  if (updated.status === "fulfilled" && !fulfilledIn) {
    throw new Error("Fulfilled promises must include fulfilledIn.");
  }
  if (updated.status !== "fulfilled" && fulfilledIn) {
    throw new Error("Only fulfilled promises may set fulfilledIn.");
  }

  const [row] = await db
    .update(promises)
    .set({
      status: updated.status,
      fulfilledInScene: fulfilledIn ?? null,
      updatedAt: new Date()
    })
    .where(eq(promises.id, promiseId))
    .returning();

  return mapPromiseRow(row);
}
