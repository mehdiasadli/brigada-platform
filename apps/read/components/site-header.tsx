import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@brigada/ui/components/avatar";
import Link from "next/link";
import { env } from "../env";
import { authAppUrl } from "../lib/auth-url";
import { initials } from "../lib/initials";
import { getServerSession } from "../lib/session";
import { LogoutButton } from "./logout-button";
import { SiteNav } from "./site-nav";

export async function SiteHeader() {
  const session = await getServerSession();
  const user = session?.user;
  const signOutHref = authAppUrl(env.NEXT_PUBLIC_APP_URL);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background">
      <nav className="mx-auto flex min-h-14 max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-sm md:px-10">
        <SiteNav />
        {user ? (
          <div className="ml-auto flex items-center gap-2">
            <Link
              className="flex items-center gap-2"
              href={user.username ? `/members/${user.username}` : "/members"}
            >
              <Avatar size="sm">
                {user.image ? (
                  <AvatarImage alt={user.name} src={user.image} />
                ) : null}
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <LogoutButton href={signOutHref} />
          </div>
        ) : null}
      </nav>
    </header>
  );
}
