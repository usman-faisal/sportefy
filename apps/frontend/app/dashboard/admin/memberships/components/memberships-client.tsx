"use client";

import { useState } from "react";
import { Membership } from "@sportefy/db-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createMembership, updateMembership, deleteMembership } from "@/lib/actions/membership-actions";

interface MembershipsClientProps {
  initialMemberships: Membership[];
}

export default function MembershipsClient({ initialMemberships }: MembershipsClientProps) {
  const [memberships, setMemberships] = useState<Membership[]>(initialMemberships);
  const [form, setForm] = useState<Partial<Membership>>({ name: "", price: 0, durationDays: 30, creditsGranted: 0, checkInsGranted: 0, isActive: true });

  const handleCreate = async () => {
    const res = await createMembership(form);
    if (res?.data) {
      setMemberships((prev) => [res.data as unknown as Membership, ...prev]);
      setForm({ name: "", price: 0, durationDays: 30, creditsGranted: 0, checkInsGranted: 0, isActive: true });
    }
  };

  const handleUpdate = async (id: string, payload: Partial<Membership>) => {
    const res = await updateMembership(id, payload);
    if (res?.data) {
      setMemberships((prev) => prev.map((m) => (m.id === id ? (res.data as unknown as Membership) : m)));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMembership(id);
    if (res?.success) {
      setMemberships((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Membership</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="membership-name">Name</Label>
            <Input id="membership-name" placeholder="e.g., Gold Plan" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="membership-price">Price</Label>
            <Input id="membership-price" placeholder="e.g., 4999" type="number" value={Number(form.price || 0)} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="membership-duration">Duration (days)</Label>
            <Input id="membership-duration" placeholder="e.g., 30" type="number" value={Number(form.durationDays || 0)} onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) }))} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="membership-credits">Credits granted</Label>
            <Input id="membership-credits" placeholder="e.g., 10" type="number" value={Number(form.creditsGranted || 0)} onChange={(e) => setForm((f) => ({ ...f, creditsGranted: Number(e.target.value) }))} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="membership-checkins">Check-ins granted</Label>
            <Input id="membership-checkins" placeholder="e.g., 5" type="number" value={Number(form.checkInsGranted || 0)} onChange={(e) => setForm((f) => ({ ...f, checkInsGranted: Number(e.target.value) }))} />
          </div>

          <div className="space-y-1 col-span-2">
            <Label htmlFor="membership-description">Description</Label>
            <Input id="membership-description" placeholder="Short description of the plan" value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreate}>Create</Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {memberships.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle>{m.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>Price: {m.price}</div>
              <div>Duration: {m.durationDays} days</div>
              <div>Credits: {m.creditsGranted}</div>
              <div>Check-ins: {m.checkInsGranted}</div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => handleUpdate(m.id, { isActive: !m.isActive })}>{m.isActive ? "Deactivate" : "Activate"}</Button>
              <Button variant="destructive" onClick={() => handleDelete(m.id)}>Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}


