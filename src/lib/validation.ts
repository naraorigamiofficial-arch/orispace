import { z } from "zod";

export const webUrl = z
  .string()
  .trim()
  .url("Please enter a full link starting with https://")
  .refine((value) => /^https?:\/\//i.test(value), "Links must start with http:// or https://");

export const optionalUrl = z.union([z.literal(""), webUrl]).transform((value) => value || null);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const optionalNumber = (max: number) =>
  z
    .union([z.literal(""), z.coerce.number().positive().max(max)])
    .transform((value) => (value === "" ? null : value));

export const optionalInt = (max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int().positive().max(max)])
    .transform((value) => (value === "" ? null : value));
