import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-xl mb-8">
          You don't have permission to access this page.
        </p>
        <div className="space-y-4">
          <Link 
            href="/dashboard" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Return to Dashboard
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
} 