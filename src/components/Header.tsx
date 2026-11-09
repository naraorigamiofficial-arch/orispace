import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { logout } from "@/app/actions/auth";
import { Logo } from "./Logo";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="ORISPACE home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-0.5 whitespace-nowrap text-sm sm:gap-3">
          <Link href="/starboard" className="rounded-full px-2.5 py-2 hover:bg-soft sm:px-3">
            Starboard
          </Link>
          {user && isStaff(user.role) && (
            <Link href="/staff" className="rounded-full px-2.5 py-2 hover:bg-soft sm:px-3">
              Staff
            </Link>
          )}
          {user ? (
            <>
              <Link href="/account" className="rounded-full px-2.5 py-2 hover:bg-soft sm:px-3">
                {user.name.split(" ")[0]}
              </Link>
              <form action={logout} className="hidden sm:block">
                <button className="rounded-full px-3 py-2 text-muted hover:bg-soft">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-2.5 py-2 hover:bg-soft sm:px-3">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary px-4 py-2">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
