import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // console.log("selectedBooking", selectedBooking);
  console.log("bookings", bookings);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/user/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setBookings(data.bookings);
    };

    fetchBookings();
  }, []);

  const filteredBookings =
    filterType === "All"
      ? bookings
      : bookings.filter((b) => b.type === filterType);

  const handleRateClick = (booking) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    // setSelectedBooking(booking);
    setRatingBooking(booking);

    setShowRateModal(true);
  };

  const submitReview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!ratingBooking) {
        toast.error("No booking selected");
        return;
      }

      const response = await fetch(`${BASE_URL}/user/add-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId:
            ratingBooking.type === "Movie" ? ratingBooking.movie?._id : null,
          showId:
            ratingBooking.type === "Show"
              ? ratingBooking.details?.showId
              : null,
          type: ratingBooking.type, 
          rating,
          reviewText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // SUCCESS
      toast.success("Review submitted successfully 🎉");

      setShowRateModal(false);
      setRatingBooking(null);
      setRating(0);
      setReviewText("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review ❌");
    }
  };

  const canRateBooking = (booking) => {
    let bookingDate;

    if (booking.type === "Movie") {
      bookingDate = new Date(booking.showDate);
    } else {
      bookingDate = new Date(booking.details?.date);
    }

    const today = new Date();

    // remove time part
    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return today > bookingDate;
  };

  return (
    <section className="px-4 sm:px-6 md:px-16 py-12">
      <ToastContainer position="top-right" />

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 text-white">
        My Booking
      </h2>
      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-4 bg-white p-3 rounded shadow mb-6 text-sm font-medium justify-center sm:justify-start">
        <button
          onClick={() => setFilterType("All")}
          className={`${
            filterType === "All"
              ? "text-purple-900 border-b-2 border-red-500"
              : "text-purple-950"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilterType("Movie")}
          className={`${
            filterType === "Movie"
              ? "text-purple-900 border-b-2 border-red-500"
              : "text-purple-950"
          }`}
        >
          Movies
        </button>

        <button
          onClick={() => setFilterType("Show")}
          className={`${
            filterType === "Show"
              ? "text-purple-900 border-b-2 border-red-500"
              : "text-purple-950"
          }`}
        >
          Show
        </button>
      </div>

      {/* BOOKING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking._id}
            className="rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between gap-4 bg-white/10 backdrop-blur-md border border-purple-800 shadow-lg"
          >
            {/* LEFT SECTION */}
            <div className="flex gap-4 sm:gap-6">
              {/* POSTER */}
              <div className="w-20 h-28 sm:w-28 sm:h-40 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                <img
                  src={
                    booking.type === "Movie"
                      ? booking.movie?.movieimage
                      : booking.show?.showImage
                  }
                />
              </div>

              {/* DETAILS */}
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-white">
                  {booking.type === "Movie"
                    ? booking.movieTitle
                    : booking.details?.showTitle}{" "}
                </h2>

                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {booking.type === "Movie"
                    ? `${new Date(booking.showDate).toDateString()} | ${booking.showTime}`
                    : `${new Date(booking.details?.date).toDateString()} | ${booking.details?.startTime}`}
                </p>

                {/* SEATS */}
                {booking.type === "Movie" && (
                  <div className="text-xs sm:text-sm text-gray-400 mt-2">
                    <p className="font-medium text-white">Seats</p>

                    {booking?.seats?.map((seat, index) => {
                      const seatLabel = seat?.seatId
                        ? seat.seatId.split("-").slice(1).join("")
                        : "N/A";

                      return (
                        <div key={index} className="flex justify-between">
                          <span>{seat?.category}</span>
                          <span>{seatLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* PRICE */}
                <p className="text-sm mt-3 font-medium text-white">
                  Amount Paid: ₹{Number(booking.totalAmount).toFixed(2)}
                </p>

                {/* PAYMENT STATUS */}
                <p
                  className={`text-xs sm:text-sm mt-1 ${
                    booking.paymentStatus === "Success"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  Payment: {booking.paymentStatus}
                </p>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex sm:flex-col justify-end sm:justify-start">
              <button
                onClick={() => setSelectedBooking(booking)}
                className="border border-purple-600 px-3 sm:px-4 py-2 rounded text-sm hover:bg-purple-200 hover:text-black sm:mb-2"
              >
                View Booking Info
              </button>

              {canRateBooking(booking) && (
                <button
                  onClick={() => handleRateClick(booking)}
                  className="border border-purple-600 px-3 sm:px-4 py-2 rounded text-sm hover:bg-purple-200 hover:text-black"
                >
                  Give Rating
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 text-black">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            {/* CLOSE BUTTON */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setSelectedBooking(null)}
            >
              ✖
            </button>

            {/* HEADER */}
            <div className="border-b p-5">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedBooking.type === "Movie"
                  ? selectedBooking.movie?.title
                  : selectedBooking.details?.showTitle}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {selectedBooking.type === "Movie"
                  ? selectedBooking.theater?.theater_name
                  : selectedBooking.details?.theaterName}
              </p>

              <p className="text-sm text-gray-500">
                {selectedBooking.type === "Movie"
                  ? `${new Date(selectedBooking.showDate).toDateString()} • ${selectedBooking.showTime}`
                  : `${selectedBooking.details?.date} • ${selectedBooking.details?.startTime}`}
              </p>
            </div>

            {/* MOVIE SEATS */}
            {selectedBooking.type === "Movie" && (
              <div className="p-5 border-b">
                <h3 className="font-semibold text-gray-800 mb-2">🎟 Seats</h3>

                <div className="space-y-1 text-sm">
                  {selectedBooking?.seats?.map((seat, index) => {
                    const seatLabel = seat?.seatId
                      ? seat.seatId.split("-").slice(1).join("")
                      : "N/A";

                    return (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{seat.category}</span>
                        <span className="font-medium">{seatLabel}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-sm">
                  <b>Tickets:</b> {selectedBooking.seats.length}
                </p>
              </div>
            )}

            {/* SHOW TICKETS */}
            {selectedBooking.type === "Show" && (
              <div className="p-5 border-b text-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  🎭 Show Details
                </h3>

                <p>
                  <b>Location:</b> {selectedBooking.details?.locationName}
                </p>

                <p>
                  <b>Duration:</b> {selectedBooking.details?.duration} mins
                </p>

                <p>
                  <b>Price per Ticket:</b> ₹{selectedBooking.details?.price}
                </p>
              </div>
            )}

            {/* FOOD (Movie Only) */}
            {selectedBooking.foodItems?.length > 0 && (
              <div className="p-5 border-b">
                <h3 className="font-semibold text-gray-800 mb-2">
                  🍿 Food & Beverages
                </h3>

                <div className="space-y-2 text-sm">
                  {selectedBooking.foodItems.map((food, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {food.name} × {food.quantity}
                      </span>

                      <span className="font-medium">
                        ₹{food.price * food.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRICE BREAKDOWN */}
            <div className="p-5 border-b text-sm space-y-2">
              {selectedBooking.type === "Movie" && (
                <div className="flex justify-between">
                  <span>Ticket Price</span>
                  <span>₹{selectedBooking.ticketPrice}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span>₹{selectedBooking.convenienceFee}</span>
              </div>

              <div className="flex justify-between">
                <span>CGST</span>
                <span>₹{selectedBooking.cgst}</span>
              </div>

              <div className="flex justify-between">
                <span>SGST</span>
                <span>₹{selectedBooking.sgst}</span>
              </div>

              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total Paid</span>
                <span className="text-green-600">
                  ₹{selectedBooking.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* QR CODE */}
            <div className="flex flex-col items-center p-6">
              <QRCode
                value={JSON.stringify({
                  bookingId: selectedBooking._id,
                  type: selectedBooking.type,
                  title:
                    selectedBooking.type === "Movie"
                      ? selectedBooking.movieTitle
                      : selectedBooking.details?.showTitle,
                  paymentId: selectedBooking.paymentId,
                })}
                size={160}
              />

              <p className="text-xs text-gray-500 mt-3">
                Scan this code at the entry
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal  */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-[400px] p-6 rounded-xl relative">
            {" "}
            {/* Close Button */}
            <button
              onClick={() => setShowRateModal(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">
              Rate this {ratingBooking?.type}{" "}
            </h2>
            {/* ⭐ Rating */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review..."
              className="w-full border p-2 rounded mb-4 text-black"
            />
            <button
              onClick={submitReview}
              className="bg-red-600 text-white w-full py-2 rounded-lg cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
export default Booking;
