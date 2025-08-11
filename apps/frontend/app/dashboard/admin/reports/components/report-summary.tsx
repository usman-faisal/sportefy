import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardReport } from "@/lib/api/types";
import { DollarSign } from "lucide-react";

interface ReportSummaryProps {
  summary: DashboardReport["summary"];
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ summary }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${summary.dailyRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total revenue from confirmed bookings today.
          </p>
        </CardContent>
      </Card>
      {/* You can add more summary cards here as your API expands */}
    </div>
  );
};
