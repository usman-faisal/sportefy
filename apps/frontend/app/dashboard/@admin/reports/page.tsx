import { reportService } from "@/lib/api/services";
import { ReportsClient } from "./components/client";

export default async function ReportsPage() {
  const reportData = await reportService.getDashboardReports();

  if (!reportData) {
    return <div>No report data found.</div>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ReportsClient data={reportData} />
      </div>
    </div>
  );
}
