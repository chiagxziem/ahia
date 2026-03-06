import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { UsersClient } from "./users-client";

// Mock data fetcher to simulate Cache Component feature with suspense
const fetchUsers = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    {
      id: "usr_1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
      status: "active",
      joinedAt: "2024-01-15T08:00:00Z",
    },
    {
      id: "usr_2",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "user",
      status: "active",
      joinedAt: "2024-02-20T10:30:00Z",
    },
    {
      id: "usr_3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "user",
      status: "inactive",
      joinedAt: "2024-03-05T14:20:00Z",
    },
    {
      id: "usr_4",
      name: "Diana Prince",
      email: "diana@example.com",
      role: "superadmin",
      status: "active",
      joinedAt: "2023-11-10T09:15:00Z",
    },
    {
      id: "usr_5",
      name: "Evan Wright",
      email: "evan@example.com",
      role: "user",
      status: "suspended",
      joinedAt: "2024-01-25T16:45:00Z",
    },
  ];
};

const UsersData = async () => {
  const data = await fetchUsers();
  return <UsersClient data={data} />;
};

const AdminUsersPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles.</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-100 w-full rounded-md" />}>
        <UsersData />
      </Suspense>
    </div>
  );
};

export default AdminUsersPage;
