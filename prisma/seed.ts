// Fills in the starting lists used by filters. Safe to run more than once.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Animals",
  "Insects",
  "Dragons and mythical creatures",
  "Birds",
  "Sea life",
  "People",
  "Plants and flowers",
  "Geometric",
  "Tessellations",
  "Modular",
  "Objects",
  "Other",
];

const techniques = [
  "Box pleating",
  "Circle packing",
  "22.5 degree",
  "Uniaxial base",
  "Tessellation",
  "Wet folding",
  "Modular",
  "Curved folding",
  "Color change",
  "Traditional bases",
];

const paperTypes = [
  "Kami",
  "Tissue foil",
  "Double tissue",
  "Elephant Hide",
  "Washi",
  "Unryu",
  "Lokta",
  "Kraft",
  "Foil",
  "Tant",
  "Sandwich",
  "Other",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  for (const [position, name] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, position },
      create: { slug: slugify(name), name, position },
    });
  }
  for (const name of techniques) {
    await prisma.technique.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { slug: slugify(name), name },
    });
  }
  for (const name of paperTypes) {
    await prisma.paperType.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { slug: slugify(name), name },
    });
  }
  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
