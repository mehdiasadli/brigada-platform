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

const links = [
  { href: "/books", label: "Books" },
  { href: "/sessions", label: "Sessions" },
  { href: "/members", label: "Members" },
] as const;

export async function SiteHeader() {
  const session = await getServerSession();
  const user = session?.user;
  const signOutHref = authAppUrl(env.NEXT_PUBLIC_APP_URL);

  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 text-sm">
        <Link className="font-medium" href="/">
          Read
        </Link>
        {links.map((link) => (
          <Link
            className="text-muted-foreground hover:text-foreground"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
        {user ? (
          <div className="ml-auto flex items-center gap-2">
            <Link
              className="flex items-center gap-2 hover:text-foreground"
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
