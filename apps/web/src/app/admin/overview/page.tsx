import { OverviewStats } from "./overview-stats";

const AdminOverviewPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="font-bricolage text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Welcome to the Ahia admin dashboard.</p>
      </div>

      <OverviewStats />
    </div>
  );
};

export default AdminOverviewPage;
