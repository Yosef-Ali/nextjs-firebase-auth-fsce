export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Resources</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full lg:col-span-2">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Reports and Reviews
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Annual Impact Report 2023
                </h3>
                <p className="text-gray-600 mt-2 mb-4">
                  Comprehensive overview of our programs, achievements, and impact 
                  metrics for the year 2023.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Published: Jan 2024</span>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Download PDF →
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Strategic Plan 2024-2026
                </h3>
                <p className="text-gray-600 mt-2 mb-4">
                  Our three-year strategic framework for expanding child protection 
                  services and community impact.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Published: Dec 2023</span>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Download PDF →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              FSCE Publications
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Child Protection Guidelines
                </h3>
                <p className="text-gray-600 mt-2 mb-4">
                  Comprehensive guide for implementing child protection measures in 
                  communities and institutions.
                </p>
                <a 
                  href="#" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read More →
                </a>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Community Engagement Toolkit
                </h3>
                <p className="text-gray-600 mt-2 mb-4">
                  Resources and strategies for effective community mobilization and 
                  participation in child welfare programs.
                </p>
                <a 
                  href="#" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read More →
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-full lg:col-span-1">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Case Stories
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Transforming Lives Through Education
                  </h3>
                  <p className="text-gray-600 mt-2">
                    The story of how our education support program helped a young girl 
                    return to school and pursue her dreams.
                  </p>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 font-medium block mt-2"
                  >
                    Read Story →
                  </a>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Building Stronger Communities
                  </h3>
                  <p className="text-gray-600 mt-2">
                    How our community-based programs are creating lasting change in 
                    local neighborhoods.
                  </p>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 font-medium block mt-2"
                  >
                    Read Story →
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
