export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" /> {/* Navbar space */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Page title skeleton */}
          <div className="h-10 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded w-64" />

          {/* Filter bar skeleton */}
          <div className="flex gap-3 mt-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-full w-24" />
            ))}
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
