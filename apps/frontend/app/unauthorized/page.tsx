import { signOut } from "@/lib/actions/auth-actions";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Unauthorized</h1>
        <p className="mt-4 text-lg text-gray-700">
          You do not have permission to access this page.
        </p>
        <button onClick={signOut}>
            Signout
        </button>
      </div>
    </div>
  );
}