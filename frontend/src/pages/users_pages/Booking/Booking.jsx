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
  // console.log("bookings", bookings);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [movie, setMovies] = useState({});
  const [filterType, setFilterType] = useState("All");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingData, setCancelBookingData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({});

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

  const filteredBookings = bookings.filter((b) => {
    if (filterType === "All") {
      return ["Confirmed", "Partially Cancelled"].includes(b.bookingStatus);
    }

    if (filterType === "Cancelled") {
      return b.bookingStatus === "Cancelled";
    }

    return b.type === filterType;
  });

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

    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return today > bookingDate;
  };

  const openGoogleCalender = (booking) => {
    let title = "";
    let startDateTime;
    let endDateTime;
    let location = "";
    let details = "Booked via ShowHub 🎬";

    if (booking.type === "Movie") {
      title = booking.movieTitle;

      // Extract only YYYY-MM-DD
      const datePart = booking.showDate.split("T")[0];

      const start = new Date(`${datePart}T${booking.showTime}`);
      startDateTime = start;

      const duration = booking.movie?.totalTiming;
      endDateTime = new Date(start.getTime() + duration * 60000);

      location = `${booking.theaterName || "Cinema Hall"}, ${booking.theater?.location_name || ""}`;
    } else {
      title = booking.details?.showTitle;

      const start = new Date(
        `${booking.details?.date}T${booking.details?.startTime}`,
      );

      startDateTime = start;

      const duration = Number(booking.details?.duration || 60);
      endDateTime = new Date(start.getTime() + duration * 60000);

      location = `${booking.theaterName || "Event Venue"}, ${booking.details?.locationName || ""}`;
    }

    const formatDate = (date) => {
      if (isNaN(date)) return "";
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const startStr = formatDate(startDateTime);
    const endStr = formatDate(endDateTime);

    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
      title,
    )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
      details,
    )}&location=${encodeURIComponent(location)}&ctz=Asia/Kolkata`;

    window.open(url, "_blank");
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelBookingData(null);
    setSelectedSeats([]);
    setSelectedFoods([]);
  };

  const handleCancelClick = async (booking) => {
    if (booking.type === "Show") return;

    const confirmCancel = window.confirm("Cancel full booking?");
    if (!confirmCancel) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/user/cancel-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId: booking._id }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Booking cancelled ✅");
      setShowCancelModal(false);

      // refresh bookings
      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id
            ? {
                ...b,
                bookingStatus: "Cancelled",
                refundAmount: data.refundAmount || b.totalAmount,
                refundStatus: "Fully Refunded",
              }
            : b,
        ),
      );
      closeCancelModal();
    } else {
      toast.error(data.message);
    }
  };

  const handleSeatSelect = (e, seatId) => {
    if (e.target.checked) {
      setSelectedSeats((prev) => [...prev, seatId]);
    } else {
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
    }
  };

  const handleFoodSelect = (e, foodId) => {
    if (e.target.checked) {
      setSelectedFoods((prev) => [...prev, foodId]);
    } else {
      setSelectedFoods((prev) => prev.filter((id) => id !== foodId));
    }
  };

  const cancelSelectedSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Select seats first");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/user/cancel-seats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bookingId: cancelBookingData._id,
        seatIds: selectedSeats,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Seats cancelled ✅");

      setBookings((prevBookings) =>
        prevBookings.map((booking) => {
          if (booking._id !== cancelBookingData._id) return booking;

          return {
            ...booking,
            bookingStatus:
              booking.seats.filter(
                (s) =>
                  !selectedSeats.includes(s.seatId) && s.status === "Booked",
              ).length === 0
                ? "Cancelled"
                : "Partially Cancelled",

            refundAmount: data.refundAmount || booking.refundAmount || 0,
            refundStatus:
              data.refundStatus ||
              (booking.bookingStatus === "Cancelled"
                ? "Fully Refunded"
                : "Partially Refunded"),

            seats: booking.seats.map((seat) =>
              selectedSeats.includes(seat.seatId)
                ? { ...seat, status: "Cancelled" }
                : seat,
            ),
          };
        }),
      );

      setShowCancelModal(false);

      setSelectedSeats([]);
      setCancelBookingData(null);
      closeCancelModal();
    } else {
      toast.error(data.message);
    }
  };

  const cancelSelectedFood = async () => {
    if (Object.keys(selectedFoods).length === 0) {
      toast.error("Select food items first");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/user/cancel-food`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bookingId: cancelBookingData._id,
        foodIds: selectedFoods,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Food items cancelled ✅");

    const updatedBookingId = cancelBookingData._id;

    setBookings((prev) =>
      prev.map((booking) => {
        if (booking._id !== updatedBookingId) return booking;

        return {
          ...booking,
          foodItems: booking.foodItems.map((food) => {
            const cancelQty = selectedFoods[food.foodId] || 0;

            if (cancelQty > 0) {
              const newCancelledQty = (food.cancelledQty || 0) + cancelQty;

              return {
                ...food,
                cancelledQty: newCancelledQty,
                refundAmount: data.refundAmount || booking.refundAmount || 0,
                refundStatus: "Partially Refunded",
              };
            }

            return food;
          }),
        };
      }),
    );

    setCancelBookingData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        foodItems: prev.foodItems.map((food) => {
          const cancelQty = selectedFoods[food.foodId] || 0;

          if (cancelQty > 0) {
            const newCancelledQty = (food.cancelledQty || 0) + cancelQty;

            return {
              ...food,
              cancelledQty: newCancelledQty,
            };
          }

          return food;
        }),
      };
    });

    setSelectedFoods({});
    closeCancelModal();
  };

  const isCancelledTab = filterType === "Cancelled";

  const getActiveMedia = (media = []) => {
    if (!media || media.length === 0) return null;

    // 1. Active Image (priority)
    const activeImage = media.find(
      (item) => item.type === "image" && item.isActive,
    );

    if (activeImage) return activeImage.url;

    // 2. Active YouTube (fallback)
    const activeVideo = media.find(
      (item) => item.type === "youtube" && item.isActive,
    );

    if (activeVideo) {
      return `https://img.youtube.com/vi/${activeVideo.url}/hqdefault.jpg`;

      // type: "youtube",
      // url: activeVideo.url,
    }

    return null;
  };

  const imageUrl = getActiveMedia() || "/no-image.png";
  const handleNavigate = (booking) => {
    if (booking.type === "Movie") {
      navigate(`/movie/${booking.movie?.slug}/${booking.movie?._id}`);
    } else {
      navigate(`/single-show/${booking.details?.showId}`);
    }
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
        <button
          onClick={() => setFilterType("Cancelled")}
          className={`${
            filterType === "Cancelled"
              ? "text-purple-900 border-b-2 border-red-500"
              : "text-purple-950"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* BOOKING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking._id}
            className="relative rounded-xl p-4 sm:p-6 pb-12 flex flex-col sm:flex-row sm:justify-between gap-4 bg-white/10 backdrop-blur-md border border-purple-800 shadow-lg"
          >
            {/* LEFT SECTION */}
            <div className="flex gap-4 sm:gap-6">
              {/* POSTER */}
              <div
                onClick={() => handleNavigate(booking)}
                className="w-20 h-28 sm:w-28 sm:h-40 bg-gray-200 rounded flex items-center justify-center overflow-hidden cursor-pointer"
              >
                {(() => {
                  const imageUrl =
                    booking.type === "Movie"
                      ? booking.movie?.movieimage
                      : getActiveMedia(booking.show?.media) || "/no-image.png";

                  return (
                    <img
                      src={imageUrl}
                      className="w-full h-full object-cover"
                    />
                  );
                })()}
              </div>

              {/* DETAILS */}
              <div className="flex-1">
                <h2
                  onClick={() => handleNavigate(booking)}
                  className="text-base sm:text-lg font-semibold text-white cursor-pointer"
                >
                  {booking.type === "Movie"
                    ? booking.movieTitle
                    : booking.details?.showTitle}{" "}
                </h2>

                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {booking.type === "Movie"
                    ? `${new Date(booking.showDate).toDateString()} | ${booking.showTime}`
                    : `${new Date(booking.details?.date).toDateString()} | ${booking.details?.startTime}`}
                </p>

                {booking.type === "Show" && (
                  <div>
                    {" "}
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Ticket Amount: ₹{booking.details?.ticketPrice}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Seat Count: {booking.details?.seatCount}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Seat Amount: ₹{booking.details?.seatAmount}
                    </p>
                  </div>
                )}

                {/* SEATS */}
                {booking.type === "Movie" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-x-10 mt-2 border-t pt-2 text-xs sm:text-sm text-gray-400">
                    {/* SEATS SECTION */}
                    <div>
                      <p className="font-medium text-white mb-1">Seats</p>

                      {booking?.seats?.map((seat, index) => {
                        const seatLabel = seat?.seatId
                          ?.split("-")
                          .slice(1)
                          .join("");

                        return (
                          <div key={index} className="flex justify-between">
                            <span
                              className={
                                seat.status === "Cancelled"
                                  ? "line-through text-red-400"
                                  : ""
                              }
                            >
                              {seat.category}
                            </span>

                            <span
                              className={
                                seat.status === "Cancelled"
                                  ? "line-through text-red-400"
                                  : ""
                              }
                            >
                              {seatLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* FOOD SECTION */}
                    {booking.foodItems?.length > 0 && (
                      <div className="sm:pl-6">
                        <p className="font-medium text-white mb-3">
                          Food & Beverages
                        </p>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left text-white">
                            <thead className="bg-purple-900 hover:bg-purple-800 text-xs text-white">
                              <tr>
                                <th className="p-2 text-xs">Food Name</th>
                                <th className="p-2 text-xs">Total Quantity</th>
                                <th className="p-2 text-xs">Cancelled Qty</th>
                                <th className="p-2 text-xs">Per Food Cost</th>
                                <th className="p-2 text-xs">Total Food Cost</th>
                              </tr>
                            </thead>

                            <tbody>
                              {booking.foodItems.map((food, index) => {
                                const cancelledQty = food.cancelledQty || 0;
                                const remainingQty =
                                  food.quantity - cancelledQty;

                                const isFullyCancelled = remainingQty === 0;
                                const displayQty = remainingQty;
                                const displayAmount = remainingQty * food.price;
                                return (
                                  <tr
                                    key={index}
                                    className={` border-gray-700 ${
                                      isFullyCancelled
                                        ? "text-red-500 line-through"
                                        : ""
                                    }`}
                                  >
                                    {/* Food Name */}
                                    <td className="p-2 ">{food.name}</td>

                                    {/* Quantity */}
                                    <td className="p-2 ">{displayQty}</td>

                                    {/* Cancelled Qty */}
                                    <td className="p-2  text-red-400">
                                      {cancelledQty || 0}
                                    </td>

                                    {/* Per item price */}
                                    <td className="p-2 ">₹{food.price}</td>

                                    {/* Total cost after cancellation */}
                                    <td className="p-2  font-medium">
                                      ₹{remainingQty * food.price}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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

                {booking.refundAmount > 0 && (
                  <p className="text-xs mt-1">
                    Refund Amount: ₹{booking.refundAmount.toFixed(2)}
                  </p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    booking.bookingStatus === "Cancelled"
                      ? "text-red-500"
                      : booking.bookingStatus === "Partially Cancelled"
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  Booking Status: {booking.bookingStatus}
                </p>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex flex-wrap sm:flex-col justify-end sm:justify-start gap-2 sm:gap-0">
              {" "}
              <button
                onClick={() => setSelectedBooking(booking)}
                className="border border-purple-600 px-3 sm:px-4 py-2 rounded text-sm hover:bg-purple-200 hover:text-black sm:mb-2"
              >
                View Booking Info
              </button>
              {booking.bookingStatus !== "Cancelled" && (
                <button
                  onClick={() => openGoogleCalender(booking)}
                  className="border border-purple-600 px-3 sm:px-4 py-2 rounded text-sm hover:bg-purple-200 hover:text-black sm:mb-2"
                >
                  Save Date Google Calender
                </button>
              )}
              {canRateBooking(booking) && (
                <button
                  onClick={() => handleRateClick(booking)}
                  className="border border-purple-600 px-3 sm:px-4 py-2 rounded text-sm hover:bg-purple-200 hover:text-black"
                >
                  Give Rating
                </button>
              )}
              {/* Cancel booking  */}
              {!canRateBooking(booking) &&
                booking.bookingStatus !== "Cancelled" && (
                  <div className="relative group w-full sm:w-auto">
                    <button
                      disabled={booking.type === "Show"}
                      onClick={() => {
                        if (booking.type === "Show") return;
                        setCancelBookingData(booking);
                        setShowCancelModal(true);
                      }}
                      className={`w-full sm:w-auto border px-3 sm:px-4 py-2 rounded text-sm 
                      ${
                        booking.type === "Show"
                          ? "border-gray-400 text-gray-400 cursor-not-allowed"
                          : "border-purple-600 hover:bg-purple-200 hover:text-black"
                      }`}
                    >
                      Cancel Booking
                    </button>

                    {/* TOOLTIP */}
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {booking.type === "Show"
                        ? "Cancellation not available for live show"
                        : "Cancel Booking"}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
      {/* booking and seat cancellation */}

      {showCancelModal && cancelBookingData && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div
            className="bg-white p-6 rounded-xl w-[90%] max-w-md relative 
                    max-h-[85vh] overflow-y-auto"
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
              onClick={closeCancelModal}
            >
              ✖
            </button>

            <h2 className="text-lg font-bold mb-4 text-black">
              Cancel Booking
            </h2>

            {/* FULL CANCEL */}
            <button
              onClick={() => handleCancelClick(cancelBookingData)}
              className="w-full bg-red-600 text-white py-2 rounded mb-3"
            >
              Cancel Full Booking
            </button>

            {/* PARTIAL CANCEL (SEATS) */}
            {cancelBookingData.seats.filter((s) => s.status === "Booked")
              .length > 1 && (
              <>
                <h3 className="font-medium mt-3 mb-2 text-black">
                  Select seats to cancel
                </h3>

                {cancelBookingData.seats.map(
                  (seat, i) =>
                    seat.status === "Booked" && (
                      <div
                        key={i}
                        className="flex justify-between items-center mb-2 text-black"
                      >
                        <span>{seat.seatId}</span>

                        <input
                          type="checkbox"
                          onChange={(e) => handleSeatSelect(e, seat.seatId)}
                        />
                      </div>
                    ),
                )}

                <button
                  onClick={cancelSelectedSeats}
                  className="w-full bg-yellow-500 text-white py-2 rounded mt-3"
                >
                  Cancel Selected Seats
                </button>
              </>
            )}

            {/* FOOD CANCEL SECTION */}
            {cancelBookingData.foodItems?.filter(
              (f) => f.foodStatus !== "Cancelled",
            ).length > 0 && (
              <>
                <h3 className="font-medium mt-4 mb-2 text-black">
                  Select food items to cancel
                </h3>

                {cancelBookingData.foodItems
                  ?.filter((f) => f.foodStatus !== "Cancelled")
                  .map((food, i) => {
                    const cancelledQty = food.cancelledQty || 0;
                    const remainingQty = food.quantity - cancelledQty;

                    if (remainingQty <= 0) return null;

                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center mb-2 text-black"
                      >
                        <div>
                          <p>{food.name}</p>
                          <p className="text-xs text-gray-500">
                            ₹{food.price} × {remainingQty}
                          </p>

                          {cancelledQty > 0 && (
                            <p className="text-xs text-red-500">
                              Cancelled: {cancelledQty}
                            </p>
                          )}
                        </div>

                        <input
                          type="number"
                          min="0"
                          max={remainingQty}
                          value={selectedFoods[food.foodId] || 0}
                          onChange={(e) =>
                            setSelectedFoods((prev) => ({
                              ...prev,
                              [food.foodId]: Number(e.target.value),
                            }))
                          }
                          className="w-16 border rounded px-2"
                        />
                      </div>
                    );
                  })}

                <button
                  onClick={cancelSelectedFood}
                  className="w-full bg-orange-500 text-white py-2 rounded mt-3"
                >
                  Cancel Selected Food
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* show booking details */}
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
                      ?.split("-")
                      .slice(1)
                      .join("");

                    return (
                      <div key={index} className="flex justify-between">
                        <span
                          className={
                            seat.status === "Cancelled"
                              ? "line-through text-red-400"
                              : ""
                          }
                        >
                          {seat.category}
                        </span>

                        <span
                          className={
                            seat.status === "Cancelled"
                              ? "line-through text-red-400"
                              : ""
                          }
                        >
                          {seatLabel}
                        </span>
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
                  <b>Price per Ticket:</b> ₹
                  {selectedBooking.details?.ticketPrice}
                </p>
                <p>
                  <b>Seat Count:</b> ₹
                  {selectedBooking.details?.seatCount}
                </p>
                <p>
                  <b>Total:</b> ₹
                  {selectedBooking.details?.seatAmount}
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
                      <span
                        className={
                          food.foodStatus === "Cancelled"
                            ? "line-through text-red-400"
                            : ""
                        }
                      >
                        {food.name} × {food.quantity}
                      </span>

                      <span
                        className={
                          food.foodStatus === "Cancelled"
                            ? "line-through text-red-400"
                            : ""
                        }
                      >
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

              {/* REFUND DETAILS */}
              {selectedBooking.refundAmount > 0 && (
                <div className="p-5 border-b text-sm space-y-2">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    💰 Refund Details
                  </h3>

                  <div className="flex justify-between">
                    <span>Refund Amount</span>
                    <span className="text-red-500 font-semibold">
                      ₹{selectedBooking.refundAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Refund Status</span>
                    <span
                      className={`font-medium ${
                        selectedBooking.refundStatus === "Fully Refunded"
                          ? "text-green-600"
                          : selectedBooking.refundStatus ===
                              "Partially Refunded"
                            ? "text-yellow-500"
                            : "text-gray-500"
                      }`}
                    >
                      {selectedBooking.refundStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* QR CODE */}
            {selectedBooking.bookingStatus !== "Cancelled" && (
              <div className="flex flex-col items-center p-6">
                <QRCode
                  value={`${window.location.origin}/verify-booking/${selectedBooking._id}`}
                  size={160}
                />

                <p className="text-xs text-gray-500 mt-3">
                  Scan this code at the entry
                </p>
              </div>
            )}
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
