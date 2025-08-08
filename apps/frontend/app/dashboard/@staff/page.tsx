export const dynamic = "force-dynamic";

export default async function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">
          Staff Dashboard
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Welcome to your facility management dashboard.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            My Facilities
          </h3>
          <div className="text-sm text-gray-500">
            Your facility management tools will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}
