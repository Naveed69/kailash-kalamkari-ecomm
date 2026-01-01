import * as React from "react";

// --- Kalamkari Sarees Data (reuse as before) ---
const kalamkariTestimonials = [
  {
    profileImage: "https://randomuser.me/api/portraits/women/32.jpg",
    name: "Priya Sharma",
    feedback: "Exquisite Peacock Motif - Perfect for Festivals",
    mainImage: "/Reviews/1.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Lakshmi Reddy",
    feedback: "Traditional Srikalahasti Art - Heritage Collection",
    mainImage: "/Reviews/2.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/56.jpg",
    name: "Anjali Patel",
    feedback: "Hand-painted Temple Border - Museum Quality",
    mainImage: "/Reviews/3.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/78.jpg",
    name: "Divya Krishnan",
    feedback: "Madhubani Fusion Kalamkari - Stunning Colors",
    mainImage: "/Reviews/4.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Meera Iyer",
    feedback: "Cotton Kalamkari - Comfortable & Elegant",
    mainImage: "/Reviews/5.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/88.jpg",
    name: "Kavita Desai",
    feedback: "Floral Kalamkari Silk - Wedding Favorite",
    mainImage: "/Reviews/6.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/21.jpg",
    name: "Shalini Menon",
    feedback: "Pen Kalamkari Masterpiece - Collector's Item",
    mainImage: "/Reviews/7.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/11.jpg",
    name: "Radha Nair",
    feedback: "Natural Dyes Kalamkari - Eco-Friendly Beauty",
    mainImage: "/Reviews/8.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/56.jpg",
    name: "Anjali Patel",
    feedback: "Hand-painted Temple Border - Museum Quality",
    mainImage: "/Reviews/9.jpg",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/78.jpg",
    name: "Divya Krishnan",
    feedback: "Madhubani Fusion Kalamkari - Stunning Colors",
    mainImage: "/Reviews/10.jpg",
  },
];

// Card for review/testimonial
const KalamkariCard = ({
  profileImage,
  name,
  feedback,
  mainImage,
  big = false,
}: (typeof kalamkariTestimonials)[0] & { big?: boolean }) => (
  <div
    className={`relative rounded-2xl overflow-hidden group transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg ${
      big
        ? "h-[400px] min-h-[320px] sm:h-[450px] sm:min-h-[380px] row-span-2"
        : "h-[180px] min-h-[120px] sm:h-[210px] sm:min-h-[140px]"
    }`}
  >
    <img
      src={mainImage}
      alt={feedback}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src =
          "https://placehold.co/800x600/8B4513/ffffff?text=Kalamkari+Saree";
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
    <div className="absolute top-0 left-0 p-4 text-white">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={profileImage}
          className="w-10 h-10 rounded-full border-2 border-white/90 shadow-md"
          alt={name}
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/40x40/EFEFEF/333333?text=" +
              name.charAt(0);
          }}
        />
        <span className="font-semibold text-sm drop-shadow-md">{name}</span>
      </div>
      <p className="text-sm font-medium leading-tight drop-shadow-md">
        {feedback}
      </p>
    </div>
  </div>
);

// Helper: Split array into chunks of n
const chunkArray = <T,>(arr: T[], chunk: number): T[][] => {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += chunk) {
    res.push(arr.slice(i, i + chunk));
  }
  return res;
};

// Grid with "one big two small" for desktop, but in mobile 2 or 3 per row
const KalamkariReviewsShowcase = () => {
  // Track window width for responsive rendering
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Group testimonials in [big, small, small] for desktop
  const groups: (typeof kalamkariTestimonials)[] = [];
  for (let i = 0; i < kalamkariTestimonials.length; i += 3) {
    groups.push(kalamkariTestimonials.slice(i, i + 3));
  }

  // For mobile, split into groups of 2 or 3 for horizontal rows
  const mobileChunks = chunkArray(kalamkariTestimonials, 3);

  return (
    <div className="w-full min-h-[50vh] p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            What Our Customers Say
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the timeless beauty of hand-painted Kalamkari sarees, where ancient artistry meets contemporary elegance
          </p>
        </div>
        {/* Mobile view: rows of 2 or 3 horizontally */}
        {isMobile ? (
          <div className="flex flex-col gap-6">
            {mobileChunks.map((row, idx) => (
              <div
                key={idx}
                className={`flex gap-4 justify-center`}
              >
                {row.map((testimonial, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-0 max-w-[320px]"
                    style={{ flexBasis: "0" }} // allow even sharing
                  >
                    <KalamkariCard {...testimonial} big={false} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {groups.map((group, groupIdx) => (
              <div
                className="
                  grid grid-cols-1 gap-6
                  md:grid-cols-3 md:grid-rows-2 md:gap-8
                  items-stretch
                "
                key={groupIdx}
              >
                {/* Big left */}
                <div className="md:col-span-2 md:row-span-2 md:row-start-1 md:col-start-1">
                  {group[0] && <KalamkariCard {...group[0]} big />}
                </div>
                {/* 2 stacked right */}
                <div className="flex flex-col gap-6 md:gap-8 md:col-span-1 md:row-span-2 md:col-start-3 md:row-start-1">
                  {group[1] && <KalamkariCard {...group[1]} />}
                  {group[2] && <KalamkariCard {...group[2]} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KalamkariReviewsShowcase;