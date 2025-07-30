"use client";

import { Profile } from "@sportefy/db-types";
import { createContext, ReactNode, useContext } from "react";

interface UserContextType extends Profile {}

export const UserContext = createContext<UserContextType | null>(null);

export default function UserProvider({
  user,
  children,
}: {
  user: Profile;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
