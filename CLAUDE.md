# ORISPACE

A public home for original origami designs. The full product spec lives in the owner's
"ORISPACE Version One Spec" doc. Key rules:

- The design comes first. The designer is always the main credit.
- No ratings. Stars are one vote per member per design, all equal. Designers cannot star their own designs. Staff can star designs they shared.
- Starboard: designs with more than 100 stars. Once on, a design stays (`starboardAt` is never cleared). Tabs: Newest (default) and All time. Never show who posted on the Starboard.
- Staff posts show a small, plain "Shared by ORISPACE Staff" line on the design page. Never highlight it.
- Staff only link to crease patterns, diagrams, videos and books. They never upload them.
- Comments are text only in version one, with threaded replies.
- Never use em dashes anywhere in site copy, labels or messages.

## Tech
Next.js 16 (App Router, server actions), PostgreSQL with Prisma 6, Tailwind 4, email through Resend.
Login is our own email and password system in `src/lib/auth.ts` (sessions stored hashed in the database).
The account whose email matches `ADMIN_EMAIL` becomes admin once that email is confirmed.
Design photos are resized in the browser, then stored in Vercel Blob (`BLOB_READ_WRITE_TOKEN`). Locally they go to `.uploads/`.
`Design.sharedByStaff` marks designs staff shared on behalf of a designer. Edit rights live in `canEditDesign` (`src/lib/designs.ts`).

## Commands
- `npm run dev` start locally
- `npm run db:migrate` change the database design
- `npm run db:seed` fill in categories, techniques and paper types
- `npm run lint` type check
