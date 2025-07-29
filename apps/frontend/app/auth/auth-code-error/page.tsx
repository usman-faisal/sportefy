import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sorry, we couldn't complete your authentication. This might be due
            to an expired or invalid link.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              The authentication link appears to be invalid or has expired.
              Please try signing in again.
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
