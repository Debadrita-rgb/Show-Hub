import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import BASE_URL from "../../../../config";
import YouTubePlayer from "./youTubePlayerComponent";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./singleShow.css";

const SingleShow = () => {
  const { id } = useParams();
  const [openVenueModal, setOpenVenueModal] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [show, setShow] = useState(null);
  const navigate = useNavigate();
  const [seatCount, setSeatCount] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalVotes: 0,
  });

  const [reviews, setReviews] = useState([]);
  
  const getDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);

    current.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    while (current <= last) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };
  
  const review_settings = {
    dots: false,
    infinite: reviews?.length > 5,
    speed: 500,
    slidesToShow: Math.min(5, reviews?.length || 1),
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, reviews?.length || 1),
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-single-show/${id}`)
      .then((res) => res.json())
      .then((data) => setShow(data))
      .catch((err) => console.log(err));
  }, [id]);

let slides = [];

if (show?.media?.length > 0) {
  slides = show.media
    .filter((item) => item.isActive === true) 
    .map((item) => {
      if (item.type === "youtube") {
        return {
          type: "video",
          videoId: item.url,
        };
      }

      return {
        type: "image",
        url: item.url,
      };
    });
}

  const settings_image = {
    dots: true,
    infinite: slides.length > 1,
    arrows: slides.length > 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 3000,
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;

    return `${hrs}h ${mins}m`;
  };

  const settings_artist = {
    dots: false,
    infinite: show?.artists?.length > 5,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  useEffect(() => {
    fetch(`${BASE_URL}/user/rating-summary/Show/${id}`)
      .then((res) => res.json())
      .then((data) => setRatingSummary(data));
  }, [id]);

  //Fetch Reviews
  const fetchReviews = () => {
    fetch(`${BASE_URL}/user/reviews/Show/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data));
  };
  useEffect(() => {
    fetchReviews();
  }, [id]);

  const formatVotes = (votes) => {
    if (votes >= 1000000) return (votes / 1000000).toFixed(1) + "M+";
    if (votes >= 1000) return (votes / 1000).toFixed(1) + "K+";
    return votes;
  };


  const getTimeAgo = (dateString) => {
    const now = new Date();
    const reviewDate = new Date(dateString);

    const diffInMs = now - reviewDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    }

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  
  const isSingleDayShow = () => {
    if (!show?.startDate || !show?.endDate) return false;

    const start = new Date(show.startDate);
    const end = new Date(show.endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return start.getTime() === end.getTime();
  };

  useEffect(() => {
  if (show && isSingleDayShow()) {
    setSelectedDate(new Date(show.startDate));
  }
  }, [show]);

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };

  const limitWords = (text, wordLimit = 10) => {
    if (!text) return "";

    const words = text.split(" ");
    if (words.length <= wordLimit) return text;

    return words.slice(0, wordLimit).join(" ") + "...";
  };
  // console.log(movie);

  const formatDateOnly = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setSeatCount(1);
  }, [selectedDate]);

  const handleSubmit = (location) => {
    const bookingData = {
      showId: show?._id,
      showTitle: show?.showName,
      theaterName: location?.theaterName,
      locationName: location?.locationName,
      startTime: location?.startTime,
      duration: location?.duration,
      seatCount: seatCount,
      seatAmount: location?.price * seatCount,

      ticketPrice: location?.price,
      date: selectedDate
        ? formatDateOnly(selectedDate)
        : location?.date
          ? formatDateOnly(new Date(location.date))
          : null,
    };

    // console.log("Booking Data:", bookingData);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }else{
    navigate("/show-payment", { state: bookingData });

    }
  };

  const canBookShow = (show) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = show?.startDate ? new Date(show.startDate) : null;
    const endDate = show?.endDate ? new Date(show.endDate) : null;

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);

    if (endDate) {
      return endDate >= today;
    }

    if (startDate) {
      return startDate >= today;
    }

    return false;
  };

  const isBookingAvailable = (date) => {
    const showDate = new Date(date);
    const today = new Date();

    showDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return showDate >= today;
  };
  if (!show) return <div className="p-20 text-center">Loading...</div>;

  const stripHTML = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };

const basePrice = show?.locations?.[0]?.price || 0;
  const totalPrice = basePrice * seatCount;


  return (
    <div className=" min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        <div className="lg:col-span-2">
          <Slider {...settings_image}>
            {slides.map((media, index) => (
              <div key={index}>
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt="show banner"
                    className="w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] object-cover rounded-lg"
                  />
                ) : (
                  <YouTubePlayer videoId={media.videoId} />
                )}
              </div>
            ))}
          </Slider>

          {show.subCategory?.length > 0 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {show.subCategory.map((subcat, i) => (
                <span
                  key={i}
                  className="bg-gray-200 text-xs sm:text-sm px-3 py-1 rounded-md text-black"
                >
                  {subcat}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 h-fit text-black">
          {" "}
          <>
            {show?.startDate && (
              <p className="mb-3">
                📅 {new Date(show.startDate).toDateString()}
                {show.endDate &&
                  new Date(show.startDate).toDateString() !==
                    new Date(show.endDate).toDateString() &&
                  ` - ${new Date(show.endDate).toDateString()}`}
              </p>
            )}
          </>
          {show.ageLimit && (
            <p className="mb-3">👥 Age Limit - {show?.ageLimit}</p>
          )}
          {show.languages?.length > 0 && (
            <p className="mb-3">
              🌐
              {show.languages.join(", ")}
            </p>
          )}
          {show?.locations?.length === 1 ? (
            <div className="mb-3">
              <div className="flex items-start gap-2 mb-2">
                <span>📍</span>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  {" "}
                  {show.locations[0].theaterName}:{" "}
                  {show.locations[0].locationName}
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                <span>⏰</span>
                <span>{show.locations[0].startTime}</span>
              </div>

              {show.locations[0].duration && (
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <span>⌛</span>
                  <span>{formatDuration(show.locations[0].duration)}</span>
                </div>
              )}

              {show.locations[0].price && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-semibold text-gray-900">
                    <div className="flex justify-between mt-3">
                      <span className="text-lg font-semibold">
                        ₹{basePrice} × {seatCount}
                      </span>
                      <span className="text-lg font-bold text-green-600 ms-4">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </span>

                  {canBookShow(show) && !isSingleDayShow() && (
                    <button
                      onClick={() => setShowDateSelector(true)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm"
                    >
                      Select booking Date
                    </button>
                  )}
                </div>
              )}

              {showDateSelector &&
                show?.startDate &&
                show?.endDate &&
                (() => {
                  return (
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      inline
                      minDate={new Date()}
                      maxDate={new Date(show.endDate)}
                      filterDate={(date) => {
                        const d = new Date(date);
                        d.setHours(0, 0, 0, 0);
                        return isBookingAvailable(d);
                      }}
                    />
                  );
                })()}

              {(selectedDate || isSingleDayShow()) && (
                <div className="mt-3">
                  <p className="mb-2 font-medium">Select Seats Count</p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setSeatCount((prev) => Math.max(1, prev - 1))
                      }
                      className="px-3 py-1 bg-gray-300 rounded"
                    >
                      -
                    </button>

                    <span className="text-lg font-semibold">{seatCount}</span>

                    <button
                      onClick={() => setSeatCount((prev) => prev + 1)}
                      className="px-3 py-1 bg-gray-300 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {selectedDate && (
                <button
                  onClick={() =>
                    handleSubmit({
                      ...show.locations[0],
                      date: selectedDate,
                    })
                  }
                  className="mt-3 w-full bg-green-500 text-white py-2 rounded-md"
                >
                  Confirm Booking
                </button>
              )}
            </div>
          ) : show?.locations?.length > 1 ? (
            <button
              onClick={() => setOpenVenueModal(true)}
              className="cursor-pointer text-red-500 font-medium hover:underline"
            >
              View {show.locations.length} Other Venues
            </button>
          ) : null}
          {show.price && (
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">₹{show.price}</span>

              <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 cursor-pointer">
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h3 className="text-2xl font-bold mb-4 text-white">{show?.showName}</h3>
      </div>
      {show.description && (
        <div className="max-w-7xl mx-auto py-10">
          <h2 className="text-2xl font-bold mb-4 text-white px-4 sm:px-6">
            About The Event
          </h2>

          <p className="text-white leading-relaxed text-sm sm:text-base max-w-4xl px-4 sm:px-6">
            {" "}
            {stripHTML(show.description)}
          </p>
        </div>
      )}

      {/* ARTISTS */}
      {show.artists?.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-6">Artists</h2>

          <div className="max-w-3xl">
            <Slider {...settings_artist}>
              {show.artists.map((artist, index) => (
                <div key={index} className="text-center px-3">
                  <img
                    src={
                      artist?.artist_image ||
                      "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small/user-icon-on-transparent-background-free-png.png"
                    }
                    className="w-40 h-52 object-cover rounded-xl mx-auto"
                  />

                  <p className="mt-2 font-medium">{artist.artist_name}</p>
                  <p className="text-sm text-gray-400">{artist.designation}</p>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

      {/* open modal to show multiple location details  */}
      {openVenueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[95%] sm:w-[85%] md:w-[650px] max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-black">Venues</h2>

              <button
                onClick={() => setOpenVenueModal(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[65vh] space-y-6 text-black">
              {" "}
              {show.locations.map((loc, index) => (
                <div key={index} className="border-b pb-4 flex flex-col gap-2">
                  <h3 className="font-semibold text-lg">
                    {loc.theaterName}: {loc.locationName}
                  </h3>

                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(loc.date).toDateString()} | {loc.startTime}
                  </p>

                  {loc.duration && (
                    <p className="text-gray-600 text-sm">
                      Duration: {formatDuration(loc.duration)}
                    </p>
                  )}

                  {loc.price && (
                    <p className="text-gray-600 text-sm">₹{loc.price}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <a
                      href={`https://www.google.com/maps/search/${loc.theaterName}`}
                      target="_blank"
                      className="text-red-500 text-sm mt-1 inline-block"
                    >
                      View On Maps
                    </a>
                    <button
                      onClick={() => {
                        setSelectedLocation(loc);
                        setSeatCount(1);
                      }}
                      disabled={!isBookingAvailable(loc.date)}
                      className={`px-5 py-2 rounded-md text-sm font-semibold transition
  ${
    isBookingAvailable(loc.date)
      ? "cursor-pointer bg-red-500 text-white hover:bg-red-600"
      : "bg-gray-400 text-gray-200 cursor-not-allowed"
  }`}
                    >
                      Book Now{" "}
                    </button>

                  </div>
                  {selectedLocation?._id === loc._id && (
                    <div className="mt-3 p-3 border rounded-lg bg-gray-100">
                      <p className="mb-2 font-medium">Select Seats</p>

                      <div className="flex items-center gap-4 mb-3">
                        <button
                          onClick={() =>
                            setSeatCount((prev) => Math.max(1, prev - 1))
                          }
                          className="px-3 py-1 bg-gray-300 rounded"
                        >
                          -
                        </button>

                        <span className="text-lg font-semibold">
                          {seatCount}
                        </span>

                        <button
                          onClick={() => setSeatCount((prev) => prev + 1)}
                          className="px-3 py-1 bg-gray-300 rounded"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex justify-between mb-3">
                        <span>
                          ₹{loc.price} × {seatCount}
                        </span>
                        <span className="font-bold text-green-600">
                          ₹{loc.price * seatCount}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleSubmit({
                            ...loc,
                            date: loc.date,
                          })
                        }
                        className="w-full bg-green-500 text-white py-2 rounded-md"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHow rating and review  */}
      {reviews?.length > 0 && (
        <div
          id="reviews-section"
          className="px-4 sm:px-10 md:px-20 py-10 sm:py-14 text-white"
        >
          {" "}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Top reviews</h2>

            <Link
              to={`/Show/${createSlug(show?.showName)}/${show._id}/user-reviews`}
            >
              <p className="text-white font-semibold cursor-pointer">
                {reviews.length} Reviews →
              </p>
            </Link>
          </div>
          <p className="text-white mb-6">
            Summary of {formatVotes(ratingSummary.totalVotes)} reviews.
          </p>
          <Slider {...review_settings}>
            {reviews.map((review) => (
              <div key={review._id} className="px-3">
                <div className="bg-purple-300 hover:bg-purple-400 rounded-xl p-5 shadow-md h-[250px] flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://static.vecteezy.com/system/resources/previews/019/879/198/non_2x/user-icon-on-transparent-background-free-png.png"
                        alt="user"
                        className="w-18 h-10 rounded-full"
                      />

                      <div>
                        <p className="font-semibold text-black">
                          {review.userId?.name
                            ? `${review.userId?.name.slice(0, 10)}${review.userId?.name.length > 10 ? "..." : ""}`
                            : "User"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-red-500 font-bold">
                      ⭐ {review.rating}/5
                    </div>
                  </div>

                  <Link
                    to={`/Show/${createSlug(show?.showName)}/${show._id}/user-reviews`}
                  >
                    <p className="mt-4 text-gray-700 cursor-pointer hover:text-black transition">
                      {limitWords(review.reviewText, 10)}
                    </p>
                  </Link>

                  <div className="flex justify-end mt-4 text-gray-500 text-sm">
                    <p className="text-black">{getTimeAgo(review.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default SingleShow;
