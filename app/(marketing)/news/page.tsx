export default function NewsPage() {
  const news = [
    {
      title: "FSCE Launches New Child Protection Initiative",
      date: "March 15, 2024",
      summary: "A groundbreaking program aimed at strengthening community-based child protection mechanisms.",
      category: "Program Launch",
      image: "/images/placeholder.jpg"
    },
    {
      title: "Annual Report Shows Significant Impact in Child Welfare",
      date: "March 1, 2024",
      summary: "Our 2023 annual report reveals substantial progress in child protection and community development.",
      category: "Reports",
      image: "/images/placeholder.jpg"
    },
    {
      title: "Partnership Agreement with Ministry of Education",
      date: "February 20, 2024",
      summary: "New collaboration to enhance educational support for vulnerable children.",
      category: "Partnerships",
      image: "/images/placeholder.jpg"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Latest News</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200">
              {/* Image placeholder - replace with actual images */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Image Placeholder
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <span className="text-sm text-blue-600 font-medium">
                  {item.category}
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {item.date}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {item.summary}
              </p>
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Read more →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Upcoming Events
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Child Protection Workshop
                </h3>
                <p className="text-gray-600 mt-1">
                  Training session for community leaders and social workers
                </p>
              </div>
              <div className="text-right">
                <div className="text-blue-600 font-medium">April 5, 2024</div>
                <div className="text-gray-500 text-sm">9:00 AM - 4:00 PM</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Community Awareness Campaign
                </h3>
                <p className="text-gray-600 mt-1">
                  Public event focusing on child rights and protection
                </p>
              </div>
              <div className="text-right">
                <div className="text-blue-600 font-medium">April 15, 2024</div>
                <div className="text-gray-500 text-sm">2:00 PM - 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
