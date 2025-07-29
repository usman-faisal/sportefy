import { signOut } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/data/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Dashboard
              </h1>
              <p className="text-gray-600">Hello, {user.email}!</p>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
