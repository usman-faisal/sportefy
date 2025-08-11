"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, UserPlus, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { UserScopeWithRelations } from "@/lib/api/types";
import { 
  addVenueModerator, 
  removeVenueModerator, 
  searchUsers 
} from "@/lib/actions/user-scope-actions";
import { Venue } from "@sportefy/db-types";

interface VenueUserScopesClientProps {
  venue: Venue;
  userScopes: UserScopeWithRelations[];
}

export default function VenueUserScopesClient({
  venue,
  userScopes,
}: VenueUserScopesClientProps) {
  const [isAddingModerator, setIsAddingModerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchUsers(searchQuery);
      if (result.success) {
        setSearchResults(result.data || []);
      } else {
        toast.error(result.error || "Failed to search users");
      }
    } catch (error) {
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };
  const handleAddModerator = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    if (!venue.facilityId) {
      toast.error("This venue is not associated with a facility");
      return;
    }

    setIsAddingModerator(true);
    try {
      const result = await addVenueModerator(venue.facilityId, venue.id, {
        userId: selectedUser,
      });
      
      if (result.success) {
        toast.success("Moderator added successfully");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to add moderator");
      }
    } catch (error) {
      toast.error("Failed to add moderator");
    } finally {
      setIsAddingModerator(false);
      setSelectedUser("");
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    if (!venue.facilityId) {
      toast.error("This venue is not associated with a facility");
      return;
    }

    try {
      const result = await removeVenueModerator(venue.facilityId, venue.id, userId);
      if (result.success) {
        toast.success("Moderator removed successfully");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to remove moderator");
      }
    } catch (error) {
      toast.error("Failed to remove moderator");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Moderator Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Moderator
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Moderator</DialogTitle>
            <DialogDescription>
              Search for a user and assign them as a moderator for this venue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search" className="text-right">
                Search User
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchUsers()}
                />
                <Button 
                  onClick={handleSearchUsers} 
                  disabled={isSearching}
                  size="sm"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Select User</Label>
                <div className="col-span-3">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchResults.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {!venue.facilityId && (
              <div className="col-span-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Note: This venue is not associated with a facility. Moderators can only be added to venues that belong to a facility.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddModerator} 
              disabled={!selectedUser || isAddingModerator || !venue.facilityId}
            >
              {isAddingModerator ? "Adding..." : "Add Moderator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Current Moderators List */}
      <div className="space-y-4">
        {userScopes.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No moderators</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No moderators have been assigned to this venue yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userScopes.map((scope) => (
              <Card key={scope.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <Badge variant="secondary">
                        moderator
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">
                        {scope.profile?.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {scope.profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Added {scope.grantedAt ? new Date(scope.grantedAt).toLocaleDateString() : "Unknown"}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Moderator</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {scope.profile?.fullName} as a moderator? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveModerator(scope.userId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
