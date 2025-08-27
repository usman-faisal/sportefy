export const dynamic = "force-dynamic";

import { membershipService } from "@/lib/api/services";
import MembershipsClient from "./components/memberships-client";

export default async function AdminMembershipsPage() {
  const memberships = await membershipService.getAll();
  return <MembershipsClient initialMemberships={memberships} />;
}


