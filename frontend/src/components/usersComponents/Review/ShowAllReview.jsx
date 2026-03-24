import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const ShowAllReview = () => {
  const { type, id, slug } = useParams();
  const navigate = useNavigate();
const [show, setShow] = useState(null);

  const [movie, setMovie] = useState(null);

  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalVotes: 0,
  });
  const [reviews, setReviews] = useState([]);

  //Fetch Movie
  useEffect(() => {
    if (!id || !type) return;

    if (type === "Movie") {
      fetch(`http://localhost:5000/user/get-single-movie/${id}`)
        .then((res) => res.json())
        .then((data) => setMovie(data));
    }

    if (type === "Show") {
      fetch(`http://localhost:5000/user/get-single-show/${id}`)
        .then((res) => res.json())
        .then((data) => setShow(data));
    }
  }, [id, type]);
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

  useEffect(() => {
    fetch(`http://localhost:5000/user/rating-summary/${type}/${id}`)
      .then((res) => res.json())
      .then((data) => setRatingSummary(data));
  }, [id]);

  const fetchReviews = () => {
    fetch(`http://localhost:5000/user/reviews/${type}/${id}`)
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

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };
//   console.log("Movie", movie);
  return (
    <div className="min-h-screen text-white px-4 sm:px-6 md:px-8 lg:px-16">
      {" "}
      {/* CENTER RATING SECTION */}
      <div className="flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Rating of {type === "Movie" ? movie?.title : show?.showName}
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-l font-light">
            ⭐ {ratingSummary.averageRating?.toFixed(1) || "0.0"}/5
          </p>

          <p className="text-white px-2">
            ({formatVotes(ratingSummary.totalVotes)} Votes)
          </p>
        </div>
        {/* Book Ticket Button */}
        {type === "Movie" && movie && (
          <Link
            to={`/movie/${createSlug(movie.title)}/${movie._id}/book-movie`}
            className="mt-6"
          >
            <button className="bg-red-600 hover:bg-red-700 transition px-8 py-3 rounded-lg font-semibold text-white cursor-pointer">
              Book Tickets
            </button>
          </Link>
        )}
      </div>
      {/*  REVIEWS SECTION */}
      {reviews.length > 0 && (
        <div id="reviews-section" className="py-8 sm:py-10">
          {" "}
          <h5 className="text-l font-bold mb-6 text-left">
            User Reviews ({reviews.length})
          </h5>
          {reviews.map((review) => (
            <div key={review._id} className="bg-gray-900 p-4 rounded-lg mb-4">
              {/* Top */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/019/879/198/non_2x/user-icon-on-transparent-background-free-png.png"
                    alt="user"
                    className="w-12 h-12 rounded-full bg-white"
                  />

                  <p className="font-semibold">
                    {review.userId?.name || "User"}
                  </p>
                </div>

                <div className="text-red-500 font-bold">
                  ⭐ {review.rating}/5
                </div>
              </div>

              {/* Review */}
              <p className="mt-4 text-gray-300">{review.reviewText}</p>

              {/* Time */}
              <div className="flex justify-end mt-4 text-gray-500 text-sm">
                {getTimeAgo(review.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowAllReview;
