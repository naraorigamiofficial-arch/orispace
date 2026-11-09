"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  checkPassword,
  endSession,
  getCurrentUser,
  hashPassword,
  sendPasswordResetEmail,
  sendVerificationEmail,
  startSession,
  consumeEmailToken,
} from "@/lib/auth";

export type FormState = { error?: string; message?: string } | undefined;

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "Username must be 3 to 20 letters, numbers or underscores."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, username, email, password } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true },
  });
  if (existing) {
    return {
      error:
        existing.email === email
          ? "An account with this email already exists. Try logging in."
          : "This username is taken. Please choose another.",
    };
  }

  const user = await db.user.create({
    data: { name, username, email, passwordHash: await hashPassword(password) },
  });
  await startSession(user.id);
  await sendVerificationEmail(user);
  redirect("/account?welcome=1");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user && (await checkPassword(parsed.data.password, user.passwordHash));
  if (!user || !valid) return { error: "Email or password is incorrect." };
  if (user.disabledAt) return { error: "This account has been disabled." };

  await startSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function resendVerification(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerifiedAt) return { message: "Your email is already confirmed." };
  await sendVerificationEmail(user);
  return { message: "We sent a new confirmation link to your email." };
}

export async function requestPasswordReset(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Please enter a valid email." };
  const user = await db.user.findUnique({ where: { email: email.data } });
  if (user && !user.disabledAt) await sendPasswordResetEmail(user);
  // Same answer either way, so nobody can check which emails have accounts.
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function resetPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const password = z.string().min(8).max(200).safeParse(formData.get("password"));
  if (!password.success) return { error: "Password must be at least 8 characters." };
  const token = String(formData.get("token") ?? "");
  const userId = await consumeEmailToken(token, "RESET_PASSWORD");
  if (!userId) return { error: "This reset link has expired or was already used." };

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password.data) },
  });
  // Log out every device, then log in here.
  await db.session.deleteMany({ where: { userId } });
  await startSession(userId);
  redirect("/account?reset=1");
}
