import { requireStaff } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";

export const metadata = { title: "Staff" };

// Staff and admin tools. Each tool is added in its own build step.
export default async function StaffPage() {
  const user = await requireStaff();
  const tools = [
    { name: "Share a design", detail: "Post a design on behalf of its designer.", step: 2 },
    { name: "Designer entries", detail: "Create and edit designer entries.", step: 2 },
    { name: "Moderation queue", detail: "Reported comments and designs.", step: 6 },
  ];
  const adminTools = [
    { name: "Designer applications and claims", detail: "Approve or decline.", step: 6 },
    { name: "Team", detail: "Add and remove staff members.", step: 6 },
    { name: "Activity log", detail: "Every staff action, with who did it.", step: 6 },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Staff area</h1>
      <p className="mt-1 text-sm text-muted">Logged in as {user.name}.</p>
      <ToolGrid title="Staff tools" tools={tools} />
      {isAdmin(user.role) && <ToolGrid title="Admin tools" tools={adminTools} />}
    </div>
  );
}

function ToolGrid({
  title,
  tools,
}: {
  title: string;
  tools: { name: string; detail: string; step: number }[];
}) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.name} className="card p-5">
            <p className="font-medium">{tool.name}</p>
            <p className="mt-1 text-sm text-muted">{tool.detail}</p>
            <p className="mt-3 text-xs text-muted">Coming in build step {tool.step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
