import React from "react";
import { useLocation } from "react-router-dom";

export function BackgroundBoxesDemo() {

  const location = useLocation();

  const contentMap = {
    "/contact": {
      heading: "Get in Touch With Us",
      paragraph:
        "We’re here to help. Reach out for support, inquiries, or partnerships.",
    },
    "/testimonial": {
      heading: "Get in Touch With Us",
      paragraph:
        "We’re here to help. Reach out for support, inquiries, or partnerships.",
    },
    "/feedback": {
      heading: "Get in Touch With Us",
      paragraph:
        "We’re here to help. Reach out for support, inquiries, or partnerships.",
    },
    "/about": {
      heading: "About Our Journey",
      paragraph:
        "Discover our mission, team, and the story behind our cruise solutions.",
    },
    "/services/facilities/movies": {
      heading: "Our Premium Movies Services",
      paragraph:
        "From catering to fitness centers, explore our wide range of onboard services.",
      image:
        "https://assets.cntraveller.in/photos/64f83b063dca3e9451b2999c/master/w_1600%2Cc_limit/Disney%2520Treasure%2520-%2520Sarabi.jpg",
      textColor: "#681F19",
    },
    "/services/facilities/salon": {
      heading: "Our Premium salon Services",
      paragraph:
        "From catering to fitness centers, explore our wide range of onboard services.",
      image:
        "https://cdn.promptsnapshot.com/portfolio/user/392db36b-f765-4b8b-80ca-4d8f265948b3/o9F257qo0jOhn09oCVQfdPdU6eZXcpVuDiLVpG4DpJU%3D.png",
    },
    "/services/facilities/fitness": {
      heading: "Our Premium Fitness Centre Services",
      paragraph:
        "From catering to fitness centers, explore our wide range of onboard services.",
      image:
        "https://www.cruisedeckplans.com/DP/deckpictures/175/org/LibDec-2939-1693001825.jpg",
    },
    "/services/facilities/partyhall": {
      heading: "Our Premium Party Hall Centre Services",
      paragraph:
        "From catering to fitness centers, explore our wide range of onboard services.",
      image:
        "https://www.carnival.com/-/media/images/ships/vx/open-for-sale/carnival-venezia-frizzante-mobile-hero-2.jpg",
    },
    "/services/catering": {
      heading: "Our Premium Catering Services",
      paragraph:
        "From catering to fitness centers, explore our wide range of onboard services.",
      image:
        "https://previews.123rf.com/images/marina113/marina1132207/marina113220700464/188840221-dining-room-buffet-aboard-the-abstract-luxury-cruise-ship-healthy-breakfast-at-modern-liner-concept.jpg",
    },
    "/services/stationary": {
      heading: "Our Premium Stationary Services",
      paragraph:
        "From catering to fitness centers, explore our wide range of onboard services.",
      image:
        "https://rare-gallery.com/thumbs/865036-School-Stationery-Scissors-Pencils-Ballpoint-pen.jpg",
    },
    "/faq": {
      heading: "Frequently Ask Question",
    },
  };

  // Fallback for dynamic paths like /services/catering
  const matchedPath =
    Object.keys(contentMap).find((key) => location.pathname.startsWith(key)) ||
    "/";

  const {
    heading,
    paragraph,
    image,
    textColor = "#E1E8ED",
  } = contentMap[matchedPath];

  return (
    <div
      className="h-96 relative w-full overflow-hidden bg-cover bg-center flex items-center justify-center rounded-lg transition-all duration-500"
      style={{
        backgroundImage: `url('${
          image ||
          "https://images.pexels.com/photos/18395182/pexels-photo-18395182/free-photo-of-a-large-cruise-ship-on-the-sea.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        }')`,
      }}
    >
      <div className="relative z-20 text-center px-6">
        <div className="relative inline-block p-1 rounded-xl shadow-lg hover:scale-105 transition-transform">
          <div className="rounded-lg px-6 py-4">
            <h1
              className="text-3xl md:text-5xl font-bold"
              style={{
                color: textColor,
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
              }}
            >
              {heading}
            </h1>
            <p
              className="mt-3 text-md md:text-lg"
              style={{
                fontWeight: 'bold',
                color: textColor,
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
              }}
            >
              {paragraph}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
