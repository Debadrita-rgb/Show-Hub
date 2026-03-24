"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "./utils";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "./use-outside-click";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { format } from "date-fns";
// import "./apple.css";

// Type definitions
interface CarouselContextType {
  onCardClose: (index: number) => void;
  currentIndex: number;
}

interface CardData {
  _id: string;
  title: string;
  movieimage: string;
  category: string;
  totalTiming: string;
  releasedDate: string; // Consider using Date type if parsed early
  language: string;
  halltype: string;
  movieDescription: string;
}

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

interface CardProps {
  card: CardData;
  index: number;
  layout?: boolean;
}

// React.ImgHTMLAttributes already includes src, alt, className, height, width
interface BlurImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}
// End Type definitions

export const CarouselContext = createContext<CarouselContextType>({
  onCardClose: (index: number) => {
    // Default implementation: no-op
  },
  currentIndex: 0,
});
function formatDateToReadable(dateString: string): string {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  // Get ordinal suffix
  const ordinalSuffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${day}${ordinalSuffix} ${month}, ${year}`;
}

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return window && window.innerWidth < 768;
  };  

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0 z-1000 h-auto w-[5%] overflow-hidden bg-linear-to-l"
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              // remove max-w-4xl if you want the carousel to span the full width of its container
              "mx-auto max-w-7xl"
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                    once: true,
                  },
                }}
                key={"card" + index}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mr-10 flex justify-end gap-2">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollRight}
            // disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({ card, index, layout = false }: CardProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);
  const navigate  = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [isModalOpen]);

  


const handleBookNow = async (movieId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/signin");
    return;
  }

  const users = jwtDecode(token); // contains user.id
  try {
    const res = await axios.get(
      `http://localhost:5000/user/get-user-details/${users.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { name, email } = res.data;
    // console.log(res.data);
    // console.log(movieId);
    navigate(`/services/facilities/movies/book-movie/${movieId}`, {
      state: {
        userId: users.id,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    alert("Something went wrong. Please try again.");
  }
};

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Centered Modal Container */}
            <div className="fixed inset-0 z-50 flex justify-center items-center min-h-screen">
              <motion.div
                ref={ref}
                layoutId={`card-${card.title}`}
                className="relative w-full max-w-7xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 bg-white dark:bg-neutral-800 p-2 rounded-full shadow-md z-10"
                >
                  <CloseIcon />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-64 md:h-auto">
                  <img
                    src={card.movieimage}
                    alt={card.title}
                    className="w-50 h-50 object-cover"
                  />
                </div>

                {/* Scrollable Content Section */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[90vh] space-y-4">
                  <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {card.title}
                  </h2>
                  <button
                    className=" bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg cursor-pointer"
                    onClick={() => handleBookNow(card._id)}
                  >
                    Book Now
                  </button>
                  <div className="flex flex-wrap gap-2 mb-4 text-sm">
                    <span className="px-2 py-1 bg-gray-800 dark:bg-neutral-800 rounded">
                      ⏱ {card.totalTiming}
                    </span>
                    <span className="px-2 py-1 bg-gray-800 dark:bg-neutral-700 rounded">
                      🎬 {card.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-800 dark:bg-neutral-700 rounded">
                      📅 {formatDateToReadable(card.releasedDate)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 text-sm">
                    <span className="px-2 py-1 bg-gray-800 dark:bg-neutral-800 rounded">
                      🗣 {card.language}
                    </span>
                    <span className="px-2 py-1 bg-gray-800 dark:bg-neutral-800 rounded">
                      🏢 {card.halltype}
                    </span>
                  </div>

                  <motion.div
                    className="text-sm text-gray-700 dark:text-gray-300 mb-6"
                    dangerouslySetInnerHTML={{ __html: card.movieDescription }}
                  ></motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        className="relative z-10 flex h-80 md:h-[40rem] w-56 md:w-96 flex-col items-start justify-end overflow-hidden rounded-3xl bg-gray-100 dark:bg-neutral-900"
        onClick={() => setIsModalOpen(true)} // CLICK TO OPEN MODAL
      >
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

        {/* Card Content */}
        <div className="relative z-40 p-4 md:p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium text-white md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-1 md:mt-2 max-w-xs text-left font-sans text-xl font-semibold text-white md:text-3xl"
          >
            {card.title}
          </motion.p>
        </div>

        {/* Background Image */}
        <BlurImage
          src={card.movieimage}
          alt={card.title}
          className="absolute inset-0 z-10 h-full w-full object-cover"
        />
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: BlurImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <img
      className={cn(
        "h-50 w-50 transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      // blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};
const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};