"use client";

import { useRouter } from "next/navigation";
import { Profile } from "@sportefy/db-types";
import { ProfileWithDetails } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  MapPin,
  Phone,
} from "lucide-react";
import BookingList from "@/components/common/booking-list";

interface UserDetailProps {
  user: ProfileWithDetails | null;
  error?: string;
}

export default function UserDetail({ user, error }: UserDetailProps) {
  const router = useRouter();

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold leading-6 text-gray-900 flex items-center gap-2">
                  <User className="h-8 w-8" />
                  User Details
                </h1>
                <p className="mt-2 max-w-4xl text-sm text-gray-500">
                  View detailed information about the user.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 p-6">
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold leading-6 text-gray-900 flex items-center gap-2">
                  <User className="h-8 w-8" />
                  User Details
                </h1>
                <p className="mt-2 max-w-4xl text-sm text-gray-500">
                  View detailed information about the user.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600">Loading user details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold leading-6 text-gray-900 flex items-center gap-2">
                <User className="h-8 w-8" />
                User Details
              </h1>
              <p className="mt-2 max-w-4xl text-sm text-gray-500">
                View detailed information about {user.fullName || user.email}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
                {user.fullName?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase() ||
                  "?"}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {user.fullName || "No name provided"}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.userName && (
                  <p className="text-sm text-gray-400">@{user.userName}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Credits</p>
                  <p className="text-sm text-gray-600">{user.credits || 0}</p>
                </div>
              </div>

              {user.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{user.address}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-sm text-gray-900 font-mono">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                  {user.userName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Username
                      </p>
                      <p className="text-sm text-gray-900">@{user.userName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-3">
                  {user.createdAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created
                      </p>
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  )}
                  {user.updatedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Last Updated
                      </p>
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {user.organization && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Organization</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {user.organization}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" disabled>
                Edit User
              </Button>
              <Button variant="outline" disabled>
                Block User
              </Button>
              <Button variant="outline" disabled>
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <BookingList
        bookings={user.bookings || []}
        title="Recent Bookings"
        maxItems={5}
        emptyMessage="No bookings found for this user"
      />
    </div>
  );
}
