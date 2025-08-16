export const dynamic = "force-dynamic";

import { venueService, checkInService } from "@/lib/api/services";
import { notFound } from "next/navigation";
import { CheckInsListShared } from "@/components/common/venues/check-ins-list-shared";

interface CheckInsListPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function CheckInsListPage({
  params,
}: CheckInsListPageProps) {
  const resolvedParams = await params;
  const venue = await venueService.getVenue(resolvedParams.venueId);

  if (!venue) {
    notFound();
  }

  const checkIns = await checkInService.getVenueCheckIns(venue.id);

  return (
    <CheckInsListShared
      venue={venue}
      checkIns={checkIns || []}
      backHref={`/dashboard/admin/venues/${venue.id}`}
      userType="admin"
    />
  );
}