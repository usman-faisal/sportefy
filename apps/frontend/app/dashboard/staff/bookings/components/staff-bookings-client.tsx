"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react";
import { UserScopeWithFacilityAndVenue, BookingWithRelations } from "@/lib/api/types";
import { columns, BookingColumn } from "./columns";
import { StaffBookingCellAction } from "./staff-booking-cell-action";
import { PaginatedResponse } from "@/lib/api/api";
import { getStaffBookings } from "@/lib/actions/booking-actions";

interface StaffBookingsClientProps {
  userScopes: UserScopeWithFacilityAndVenue[];
  initialBookings: BookingWithRelations[];
  initialStats: any;
}

export const StaffBookingsClient: React.FC<StaffBookingsClientProps> = ({
  userScopes,
  initialBookings,
  initialStats,
}) => {
  const [bookings, setBookings] = useState<BookingWithRelations[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(initialStats);
  const [filters, setFilters] = useState({
    status: "all",
    venueId: "all",
    date: "",
    search: "",
  });

  // Get all venue IDs that staff has access to
  const accessibleVenueIds = userScopes
    .filter(scope => scope.venueId)
    .map(scope => scope.venueId!);

  // Get all facility IDs that staff has access to
  const accessibleFacilityIds = userScopes
    .filter(scope => scope.facilityId)
    .map(scope => scope.facilityId!);

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const result = await getStaffBookings({
        status: filters.status === "all" ? undefined : filters.status,
        venueId: filters.venueId === "all" ? undefined : filters.venueId,
        date: filters.date,
        search: filters.search,
        facilityIds: accessibleFacilityIds,
      });

      if (result.success && result.data) {
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };



  const formattedBookings: BookingColumn[] = bookings.map((item) => ({
    id: item.id,
    venueName: item.venue?.name ?? "N/A",
    status: item.status ?? "pending",
    totalCredits: item.totalCredits || 0,
    bookedBy: item.bookedByProfile || null,
    createdAt: new Date(item.createdAt!).toLocaleDateString(),
    match: item.match || null,
    slots: item.slots,
  }));

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleVenueChange = (venueId: string) => {
    setFilters(prev => ({ ...prev, venueId }));
  };

  const handleDateChange = (date: string) => {
    setFilters(prev => ({ ...prev, date }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      venueId: "all",
      date: "",
      search: "",
    });
  };

  return (
    <>
      <Heading
        title={`My Bookings (${bookings.length})`}
        description="Manage bookings for your facilities and venues"
      />
      <Separator className="my-4" />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Venue</label>
              <Select value={filters.venueId} onValueChange={handleVenueChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {userScopes
                    .filter(scope => scope.venue)
                    .map(scope => (
                      <SelectItem key={scope.venueId} value={scope.venueId!}>
                        {scope.venue?.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="Select date"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      {/* Bookings Table */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading bookings...</p>
            </div>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {(filters.status !== "all" && filters.status) || (filters.venueId !== "all" && filters.venueId) || filters.date || filters.search
                  ? "Try adjusting your filters"
                  : "No bookings have been made for your facilities yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          searchKey="search"
          columns={columns}
          data={formattedBookings}
          pagination={undefined} // We'll handle pagination later if needed
        />
      )}
    </>
  );
};
