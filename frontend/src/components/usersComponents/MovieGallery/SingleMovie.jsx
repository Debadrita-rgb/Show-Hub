import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import BASE_URL from "../../../../config";

const SingleMovie = () => {
  const { slug, id } = useParams();
  const [movie, setMovie] = useState(null);
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalVotes: 0,
  });
  const [reviews, setReviews] = useState([]); 
  
  const settings = {
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
    fetch(`${BASE_URL}/user/get-single-movie/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
      });
  }, [id]);

  useEffect(() => {
    if (movie) {
      const correctSlug = movie.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      if (slug !== correctSlug) {
        navigate(`/movie/${correctSlug}/${id}`, { replace: true });
      }
    }
  }, [movie, slug, id]);

  //Fetch the rating summary
  useEffect(() => {
    fetch(`${BASE_URL}/user/rating-summary/Movie/${id}`)
      .then((res) => res.json())
      .then((data) => setRatingSummary(data));
  }, [id]);

  //Fetch Reviews
  const fetchReviews = () => {
    fetch(`${BASE_URL}/user/reviews/Movie/${id}`)
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

  if (!movie) return <p className="text-white p-10">Loading...</p>;

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;

    return `${hrs}h ${mins}m`;
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

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };

  //limit of show 10 words in the review text
  const limitWords = (text, wordLimit = 10) => {
    if (!text) return "";

    const words = text.split(" ");
    if (words.length <= wordLimit) return text;

    return words.slice(0, wordLimit).join(" ") + "...";
  };
// console.log(movie);
  const settings_cast = {
    dots: false,
    infinite: movie?.casting?.length > 5,
    speed: 500,
    slidesToShow: 5,
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
          slidesToShow: 3,
        },
      },
    ],
  };
  const settings_crew = {
    dots: false,
    infinite: movie?.crew?.length > 5,
    speed: 500,
    slidesToShow: 5,
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
          slidesToShow: 3,
        },
      },
    ],
  };
  return (
    <div className="overflow-x-hidden">
      {" "}
      <ToastContainer position="top-right" />
      <div
        className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat flex items-center"
        style={{ backgroundImage: `url(${movie.backgroundUrl})` }}
      >
        <div className="absolute inset-0 bg-black/70"></div>

        <button
          onClick={() => setShowShareModal(true)}
          className="absolute top-4 right-4 sm:top-6 sm:right-10 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg"
        >
          🔗
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16">
          {" "}
          <div className="relative group">
            <img
              src={movie.movieimage}
              alt={movie.title}
              className="w-40 sm:w-52 md:w-60 max-w-full rounded-xl shadow-2xl"
            />

            {movie.trailerlink && (
              <Link
                to={`/movie/${createSlug(movie.title)}/${movie._id}/videos`}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-xl cursor-pointer"
              >
                <div className="text-white text-4xl">▶</div>
                <p className="text-white mt-2 font-semibold">Trailer</p>
              </Link>
            )}
          </div>
          <div className="max-w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {movie.title}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-4 bg-black/40 p-3 rounded-xl w-fit mx-auto sm:mx-0 mt-4">
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  ⭐ {ratingSummary.averageRating.toFixed(1)}/5
                </p>
                <p className="text-xs sm:text-sm text-gray-300">
                  ({formatVotes(ratingSummary.totalVotes)} Votes)
                </p>
              </div>
            </div>

            <div className="mt-4 text-sm sm:text-lg break-words">
              {formatDuration(movie.totalTiming)} • {movie.category.join(" / ")}{" "}
              • {new Date(movie.releasedDate).toDateString()}
            </div>

            <p className="mt-2 text-sm sm:text-base break-words">
              {movie.format.join(" , ")} • {movie.language.join(" , ")}
            </p>

            <Link
              to={`/movie/${createSlug(movie.title)}/${movie._id}/book-movie`}
            >
              <button className="cursor-pointer w-full sm:w-auto mt-6 bg-red-600 px-6 py-2 sm:py-3 rounded-lg font-semibold">
                Book Tickets
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10">
        {" "}
        <h2 className="text-2xl font-bold mb-4">About the movie</h2>
        <div
          className="text-white leading-7"
          dangerouslySetInnerHTML={{ __html: movie.movieDescription }}
        ></div>
      </div>
      {movie.casting?.length > 0 && (
        <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10">
          <h2 className="text-2xl font-bold mb-6">Cast</h2>

          <div className="max-w-3xl">
            <Slider {...settings_cast}>
              {movie.casting.map((cast, index) => (
                <div key={index} className="text-center px-3">
                  <img
                    src={cast.castimageURL}
                    alt={cast.castname}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                  />

                  <h3 className="mt-2 font-semibold">{cast.castname}</h3>
                  <p className="text-sm text-white">
                    {cast.inmoviecastname}
                  </p>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
      {movie.crew?.length > 0 && (
        <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10">
          <h2 className="text-2xl font-bold mb-6">Crew</h2>

          <div className="max-w-3xl">
            <Slider {...settings_crew}>
              {movie.crew.map((person) => (
                <div key={person._id} className="text-center">
                  <img
                    src={person.dpimageUrl}
                    alt={person.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                  />
                  <h3 className="mt-2 font-semibold">{person.name}</h3>
                  <p className="text-sm text-white">{person.designation}</p>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
      {reviews?.length > 0 && (
        <div
          id="reviews-section"
          className="px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14 text-white"
        >
          {" "}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Top reviews</h2>

            <Link
              to={`/Movie/${createSlug(movie.title)}/${movie._id}/user-reviews`}
            >
              <p className="text-white font-semibold cursor-pointer">
                {reviews.length} Reviews →
              </p>
            </Link>
          </div>
          <p className="text-white mb-6">
            Summary of {formatVotes(ratingSummary.totalVotes)} reviews.
          </p>
          <Slider {...settings}>
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
                    to={`/Movie/${createSlug(movie.title)}/${movie._id}/user-reviews`}
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
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-[350px] rounded-xl p-4 relative">
            {" "}
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold mb-4 text-black">Share</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
                    "_blank",
                  )
                }
                className="w-full text-left text-black"
              >
                Facebook
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${window.location.href}`,
                    "_blank",
                  )
                }
                className="w-full text-left text-black"
              >
                X (Twitter)
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }}
                className="w-full text-left text-black"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleMovie;
