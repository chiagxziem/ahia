import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUser } from "@/features/user/queries";

const AdminAuthWrapper = async ({ children }: { children: ReactNode }) => {
  const user = await getUser((await headers()).get("cookie") ?? undefined);

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    redirect("/");
  }

  return (
    <>
      <AdminSidebar user={user} />
      <SidebarInset>
        <header className="sticky top-0 big-container flex items-center gap-2 px-2 py-2 md:hidden">
          <SidebarTrigger size={"icon-lg"} />
        </header>
        <div className="big-container flex w-full flex-1 flex-col p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </>
  );
};

const AdminLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AdminAuthWrapper>{children}</AdminAuthWrapper>
      </Suspense>
    </SidebarProvider>
  );
};

export default AdminLayout;
