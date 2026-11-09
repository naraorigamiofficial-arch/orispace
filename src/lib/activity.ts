import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

// Records a staff or designer action so the admin can see who did what.
export async function logActivity(
  actorId: string,
  action: string,
  target?: { type: string; id: string },
  details?: Prisma.InputJsonValue,
) {
  await db.activityLog.create({
    data: { actorId, action, targetType: target?.type, targetId: target?.id, details },
  });
}
