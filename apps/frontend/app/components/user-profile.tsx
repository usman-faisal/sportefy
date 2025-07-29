"use client";

import { useState, useEffect } from "react";
import { userService, api } from "@/lib/api/services";

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getProfile();
      setUser(profile);
      setName(profile.name || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const updatedUser = await userService.updateProfile({ name });
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">User Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                placeholder="Enter your name"
              />
              <button
                onClick={updateProfile}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-gray-900">{user.name || "Not set"}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Member Since
          </label>
          <p className="text-gray-900">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
