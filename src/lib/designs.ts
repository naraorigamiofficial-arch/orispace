import type { Difficulty, InstructionType, Role, Structure } from "@prisma/client";
import { isAdmin, isStaff } from "./roles";

export const difficultyLabel: Record<Difficulty, string> = {
  SIMPLE: "Simple",
  INTERMEDIATE: "Intermediate",
  COMPLEX: "Complex",
  SUPER_COMPLEX: "Super complex",
};

export const structureLabel: Record<Structure, string> = {
  SINGLE_SHEET: "Single sheet",
  MODULAR: "Modular",
};

export const instructionLabel: Record<InstructionType, string> = {
  CREASE_PATTERN: "Crease pattern",
  DIAGRAM: "Diagram",
  VIDEO: "Video",
  BOOK: "Book",
};

type Editor = { id: string; role: Role };
type DesignOwnership = {
  sharedByStaff: boolean;
  designer: { userId: string | null };
};

// Who may edit a design:
// admin: any design. Staff: designs shared by staff. Designer: designs credited to them.
export function canEditDesign(user: Editor | null, design: DesignOwnership) {
  if (!user) return false;
  if (isAdmin(user.role)) return true;
  if (design.designer.userId === user.id) return true;
  return isStaff(user.role) && design.sharedByStaff;
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
