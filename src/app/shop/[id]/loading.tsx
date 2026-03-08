export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" /> {/* Navbar space */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-gray-200 rounded w-48 mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Product image skeleton */}
            <div className="aspect-square bg-gray-200 rounded-2xl" />

            {/* Product info skeleton */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>

              <div className="h-10 bg-gray-200 rounded w-1/3" />

              {/* Options skeleton */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="h-5 bg-gray-200 rounded w-20" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-16 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-20" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-8 bg-gray-200 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex gap-4 pt-6">
                <div className="h-14 bg-gray-200 rounded-xl flex-1" />
                <div className="h-14 bg-gray-200 rounded-xl w-14" />
              </div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="mt-12 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
