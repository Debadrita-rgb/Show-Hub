import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";

export default function VerifyBooking() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/get-single-booking/${id}`)
      .then((res) => setBooking(res.data))
      .catch(() => alert("Invalid booking"));
  }, [id]);

  if (!booking) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-6 text-center w-full max-w-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-600">
          ✅ Booking Verified
        </h2>

        <p className="mb-2 text-black text-sm sm:text-base">
          <span className="font-semibold">🎬 Title:</span>{" "}
          {booking.type === "Movie"
            ? booking.movieTitle
            : booking.details?.showTitle}
        </p>

        <p className="mb-2 text-black text-sm sm:text-base">
          <span className="font-semibold">📌 Type:</span> {booking.type}
        </p>

        <p className="mb-2 text-xs sm:text-sm text-gray-600 break-words">
          <span className="font-semibold">💳 Payment ID:</span>{" "}
          {booking.paymentId}
        </p>

        <p className="text-xs text-gray-400 mt-4">
          Show this screen at entry gate
        </p>
      </div>
    </div>
  );
}
