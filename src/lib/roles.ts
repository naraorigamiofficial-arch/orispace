import type { Role } from "@prisma/client";

export const isStaff = (role: Role) => role === "STAFF" || role === "ADMIN";
export const isAdmin = (role: Role) => role === "ADMIN";
export const canPostDesigns = (role: Role) =>
  role === "DESIGNER" || role === "STAFF" || role === "ADMIN";

export const roleLabel: Record<Role, string> = {
  MEMBER: "Member",
  DESIGNER: "Verified designer",
  STAFF: "ORISPACE Staff",
  ADMIN: "ORISPACE Staff",
};
