import { FacilityCreateForm } from "@/components/common/facilities/facility-create/facility-create-form";

export default function CreateFacilityPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Facility</h1>
      <FacilityCreateForm />
    </div>
  );
}
