import { UsersClient } from "./users-client";

const AdminUsersPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles.</p>
        </div>
      </div>

      <UsersClient />
    </div>
  );
};

export default AdminUsersPage;
