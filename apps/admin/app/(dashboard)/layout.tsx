import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@brigada/ui/components/sidebar";
import { TooltipProvider } from "@brigada/ui/components/tooltip";
import type { ReactNode } from "react";
import { AppSidebar } from "../../components/app-sidebar";
import { env } from "../../env";
import { authAppUrl } from "../../lib/auth-url";
import { requireAdmin } from "../../lib/require-admin";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar logoutHref={authAppUrl(env.NEXT_PUBLIC_APP_URL)} />
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
