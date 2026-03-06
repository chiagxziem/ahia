import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as React from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUser } from "@/features/user/queries";

const AdminAuthWrapper = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const user = await getUser(cookieStore.toString());

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    redirect("/");
  }

  return (
    <>
      <AdminSidebar user={user} />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </>
  );
};

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <React.Suspense fallback={null}>
        <AdminAuthWrapper>{children}</AdminAuthWrapper>
      </React.Suspense>
    </SidebarProvider>
  );
};

export default AdminLayout;
