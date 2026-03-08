export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" /> {/* Navbar space */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Profile section skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
          </div>

          {/* Navigation tabs skeleton */}
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-24" />
            ))}
          </div>

          {/* Order list skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
