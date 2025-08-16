"use client";

import React from "react";
import { VenueDetails, CheckInWithRelations } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  UserCheck,
  Clock,
  User,
  Calendar,
  LogOut,
  LogIn
} from "lucide-react";
import Link from "next/link";

interface CheckInsListSharedProps {
  venue: VenueDetails;
  checkIns: CheckInWithRelations[];
  backHref: string;
  userType: 'admin' | 'staff';
}

export function CheckInsListShared({
  venue,
  checkIns,
  backHref,
  userType
}: CheckInsListSharedProps) {
  const activeCheckIns = checkIns.filter(checkIn => !checkIn.checkOutTime);
  const completedCheckIns = checkIns.filter(checkIn => checkIn.checkOutTime);

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString();
  };

  const calculateDuration = (checkIn: Date | string, checkOut: Date | string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link href={backHref}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Venue
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Check-ins for {venue.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                View all check-in activity for this venue
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Currently Active
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCheckIns.length}</div>
              <p className="text-xs text-muted-foreground">
                People currently checked in
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Check-ins
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkIns.length}</div>
              <p className="text-xs text-muted-foreground">
                All time check-ins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Sessions
              </CardTitle>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCheckIns.length}</div>
              <p className="text-xs text-muted-foreground">
                Finished sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Check-ins */}
        {activeCheckIns.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <UserCheck className="h-5 w-5" />
                Currently Active ({activeCheckIns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{checkIn.user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{checkIn.user.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <LogIn className="h-4 w-4 text-green-600" />
                        <span>Checked in at {formatTime(checkIn.checkInTime)}</span>
                      </div>
                      <Badge variant="outline" className="mt-1 border-green-600 text-green-600">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Check-ins History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Check-in History ({checkIns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No check-ins yet
                </h3>
                <p className="text-muted-foreground">
                  Check-ins will appear here once users start using this venue.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns
                  .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
                  .map((checkIn) => (
                    <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{checkIn.user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{checkIn.user.email}</div>
                          {checkIn.booking && (
                            <div className="text-xs text-blue-600 mt-1">
                              Booking-based check-in
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <LogIn className="h-4 w-4 text-blue-600" />
                          <span>{formatDateTime(checkIn.checkInTime)}</span>
                        </div>
                        {checkIn.checkOutTime ? (
                          <>
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <LogOut className="h-4 w-4 text-red-600" />
                              <span>{formatDateTime(checkIn.checkOutTime)}</span>
                            </div>
                            <Badge variant="outline" className="border-gray-600 text-gray-600">
                              Duration: {calculateDuration(checkIn.checkInTime, checkIn.checkOutTime)}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            Currently Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}