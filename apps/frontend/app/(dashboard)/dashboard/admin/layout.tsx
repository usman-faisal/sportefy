import { profileService } from "@/lib/api/services";
import { UserRole } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await profileService.getProfile();

  if (!profile || profile.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
