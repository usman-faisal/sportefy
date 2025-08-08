"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, UserPlus, Users, Crown, Shield } from "lucide-react";
import { toast } from "sonner";
import { UserScopeWithRelations} from "@/lib/api/types";
import { 
  addFacilityModerator, 
  removeFacilityModerator, 
  searchUsers 
} from "@/lib/actions/user-scope-actions";
import { Facility } from "@sportefy/db-types";

interface FacilityUserScopesClientProps {
  facility: Facility;
  userScopes: UserScopeWithRelations[];
}

export default function FacilityUserScopesClient({
  facility,
  userScopes,
}: FacilityUserScopesClientProps) {
  const [isAddingModerator, setIsAddingModerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState<"moderator" | "owner">("moderator");
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
    if (!selectedUser || !selectedRole) {
      toast.error("Please select a user and role");
      return;
    }

    setIsAddingModerator(true);
    try {
      const result = await addFacilityModerator(facility.id, {
        userId: selectedUser,
        role: selectedRole,
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
      setSelectedRole("moderator");
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    try {
      const result = await removeFacilityModerator(facility.id, userId);
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

  const getRoleIcon = (role: string) => {
    return role === "owner" ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "owner" ? "default" : "secondary";
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
              Search for a user and assign them as a moderator or owner for this facility.
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Role</Label>
              <div className="col-span-3">
                <Select value={selectedRole} onValueChange={(value: "moderator" | "owner") => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddModerator} 
              disabled={!selectedUser || isAddingModerator}
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
              No moderators have been assigned to this facility yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userScopes.map((scope) => (
              <Card key={scope.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(scope.role)}
                      <Badge variant={getRoleBadgeVariant(scope.role)}>
                        {scope.role}
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
                            Are you sure you want to remove {scope.profile?.fullName} as a {scope.role}? 
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
