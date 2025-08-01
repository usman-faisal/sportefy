import { Suspense } from "react";
import { userService } from "@/lib/api/services";
import { ProfileWithDetails } from "@/lib/api/types";
import UserDetail from "./components/user-detail";

interface UserDetailPageProps {
  params: Promise<{
    userId: string;
  }>;
}

async function getUserData(userId: string) {
  try {
    const user = await userService.getUserDetails(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      user: user as ProfileWithDetails,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      user: null,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = await params;
  const { user, error } = await getUserData(resolvedParams.userId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserDetail user={user} error={error} />
    </Suspense>
  );
}
