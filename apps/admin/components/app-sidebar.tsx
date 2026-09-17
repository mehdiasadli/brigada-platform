"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@brigada/ui/components/sidebar";
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const manage = [
  { title: "Overview", href: "/", icon: LayoutDashboardIcon },
  { title: "Users", href: "/users", icon: UsersIcon },
] as const;

const readingClub = [
  { title: "Members", href: "/read/members", icon: UsersIcon },
  { title: "Books", href: "/read/books", icon: LibraryIcon },
  { title: "Sessions", href: "/read/sessions", icon: BookOpenIcon },
] as const;

export function AppSidebar({ logoutHref }: { logoutHref: string }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 text-sm font-medium">
        Brigada Admin
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={manage} label="Manage" pathname={pathname} />
        <NavGroup
          items={readingClub}
          label="Reading Club"
          pathname={pathname}
        />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <LogoutButton href={logoutHref} />
      </SidebarFooter>
    </Sidebar>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: readonly { title: string; href: string; icon: typeof UsersIcon }[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                }
                render={<Link href={item.href} />}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
