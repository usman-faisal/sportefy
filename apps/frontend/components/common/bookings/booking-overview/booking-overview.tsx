"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  BarChart3
} from "lucide-react";
import { BookingWithRelations } from "@/lib/api/types";
import { format } from "date-fns";

interface BookingOverviewProps {
  bookings: BookingWithRelations[];
  title?: string;
  showStats?: boolean;
  showActions?: boolean;
  onViewDetails?: (booking: BookingWithRelations) => void;
  onCheckIn?: (booking: BookingWithRelations) => void;
}

export default function BookingOverview({
  bookings,
  title = "Booking Overview",
  showStats = true,
  showActions = true,
  onViewDetails,
  onCheckIn,
}: BookingOverviewProps) {
  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  
  const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.totalCredits || 0), 0);
  const avgRevenue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  const statusGroups = {
    confirmed: bookings.filter(b => b.status === 'confirmed'),
    pending: bookings.filter(b => b.status === 'pending'),
    cancelled: bookings.filter(b => b.status === 'cancelled'),
    completed: bookings.filter(b => b.status === 'completed'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <Badge variant="outline">
            {totalBookings} total bookings
          </Badge>
        </div>
      )}

      {/* Stats Cards */}
      {showStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">All bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
              <p className="text-xs text-muted-foreground">Active bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue}</div>
              <p className="text-xs text-muted-foreground">Credits earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRevenue}</div>
              <p className="text-xs text-muted-foreground">Per booking</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Booking Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(statusGroups).map(([status, statusBookings]) => (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <span className="text-sm text-muted-foreground">{statusBookings.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      status === 'confirmed' ? 'bg-green-600' :
                      status === 'pending' ? 'bg-yellow-600' :
                      status === 'cancelled' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}
                    style={{ 
                      width: `${totalBookings > 0 ? (statusBookings.length / totalBookings) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 10).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {booking.bookedByProfile?.fullName || 'Unknown User'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.createdAt ? format(new Date(booking.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    
                      {booking.slots && booking.slots.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.slots[0].startTime ? format(new Date(booking.slots[0].startTime), 'HH:mm') : 'N/A'} - {booking.slots[0].endTime ? format(new Date(booking.slots[0].endTime), 'HH:mm') : 'N/A'}
                        </div>
                      )}
                      
                      {booking.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.venue.name}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {booking.slots?.length || 1} slots
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {booking.totalCredits || 0} credits
                      </div>
                    </div>
                  </div>
                </div>
                
                {showActions && onViewDetails && onCheckIn && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(booking)}
                    >
                      View Details
                    </Button>
                    
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => onCheckIn(booking)}
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {bookings.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
                <p className="text-muted-foreground">
                  No bookings match the current criteria.
                </p>
              </div>
            )}
            
            {bookings.length > 10 && (  
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing 10 of {bookings.length} bookings
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
