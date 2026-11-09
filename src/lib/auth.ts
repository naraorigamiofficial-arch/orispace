import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { EmailTokenType, Role } from "@prisma/client";
import { db } from "./db";
import { appUrl, sendEmail } from "./email";
import { isAdmin, isStaff } from "./roles";

const SESSION_COOKIE = "orispace_session";
const SESSION_DAYS = 30;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");

// ---------- Passwords ----------

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const checkPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// ---------- Sessions ----------

export async function startSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { id: sha256(token), userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

// The logged-in user for this request, or null. Cached for the length of one request.
export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: sha256(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || session.user.disabledAt) return null;
  const { passwordHash: _hidden, ...user } = session.user;
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser(nextPath = "/") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireVerifiedUser(nextPath = "/") {
  const user = await requireUser(nextPath);
  if (!user.emailVerifiedAt) redirect("/account?verify=needed");
  return user;
}

export async function requireStaff() {
  const user = await requireUser("/staff");
  if (!isStaff(user.role)) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/staff");
  if (!isAdmin(user.role)) redirect("/");
  return user;
}

// ---------- Email tokens ----------

async function createEmailToken(userId: string, type: EmailTokenType, hours: number) {
  const token = newToken();
  await db.emailToken.create({
    data: {
      userId,
      type,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    },
  });
  return token;
}

// Returns the user id if the token is valid, and marks it as used.
export async function consumeEmailToken(token: string, type: EmailTokenType) {
  const record = await db.emailToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!record || record.type !== type || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }
  await db.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record.userId;
}

export async function sendVerificationEmail(user: { id: string; email: string; name: string }) {
  const token = await createEmailToken(user.id, "VERIFY_EMAIL", 48);
  const link = appUrl(`/verify?token=${token}`);
  await sendEmail(
    user.email,
    "Confirm your ORISPACE email",
    `Hi ${user.name},\n\nPlease confirm your email to start starring and commenting on ORISPACE:\n\n${link}\n\nThis link works for 48 hours. If you did not sign up, you can ignore this email.`,
  );
}

export async function sendPasswordResetEmail(user: { id: string; email: string; name: string }) {
  const token = await createEmailToken(user.id, "RESET_PASSWORD", 2);
  const link = appUrl(`/reset-password?token=${token}`);
  await sendEmail(
    user.email,
    "Reset your ORISPACE password",
    `Hi ${user.name},\n\nUse this link to choose a new password:\n\n${link}\n\nThis link works for 2 hours. If you did not ask for this, you can ignore this email.`,
  );
}

// The owner's email (ADMIN_EMAIL) becomes the admin, but only after that email is confirmed.
export function roleAfterVerification(email: string, currentRole: Role): Role {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && email.toLowerCase() === adminEmail) return "ADMIN";
  return currentRole;
}
