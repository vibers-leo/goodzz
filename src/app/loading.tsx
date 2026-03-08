export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" /> {/* Navbar space */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Hero section skeleton */}
          <div className="h-64 bg-gray-200 rounded-2xl" />

          {/* Section title */}
          <div className="h-8 bg-gray-200 rounded w-48 mt-8" />

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Another section */}
          <div className="h-8 bg-gray-200 rounded w-36 mt-8" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
