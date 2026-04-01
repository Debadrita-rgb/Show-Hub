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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold mb-4">🎟 Booking Verified</h2>
        <p>
          <b>Title:</b> {booking.movieTitle}
        </p>
        <p>
          <b>Type:</b> {booking.type}
        </p>
        <p>
          <b>Payment ID:</b> {booking.paymentId}
        </p>
      </div>
    </div>
  );
}
