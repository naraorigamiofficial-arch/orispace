export const metadata = { title: "About ORISPACE Staff" };

export default function AboutStaffPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">About ORISPACE Staff</h1>
      <div className="mt-4 space-y-4 text-muted">
        <p>
          ORISPACE Staff accounts belong to our team. Staff share designs on behalf of their
          original creators, for example designers who are no longer with us or who are too busy
          to post.
        </p>
        <p>
          Every design is credited to the designer who created it. Staff only link to official
          books, diagrams, crease patterns and videos, so you get them from the designer.
        </p>
        <p>
          If you are a designer and find your work here, you can claim your designer page. Once
          approved, you can edit your designs or ask us to remove any of them.
        </p>
      </div>
    </div>
  );
}
