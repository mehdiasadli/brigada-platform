"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Read" },
  { href: "/books", label: "Books" },
  { href: "/sessions", label: "Sessions" },
  { href: "/members", label: "Members" },
] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const current = isCurrent(pathname, link.href);
        return (
          <Link
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "relative py-1 font-medium text-[#f4f4f1]"
                : "py-1 text-[#f4f4f1]/55 hover:text-[#f4f4f1]"
            }
            href={link.href}
            key={link.href}
          >
            {link.label}
            {current ? (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#d01212]" />
            ) : null}
          </Link>
        );
      })}
    </>
  );
}
