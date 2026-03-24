import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "../../../../config";

const ShowPayment = () => {
  const location = useLocation();
  const { state } = useLocation();
const navigate = useNavigate();
  const booking = location.state;
  // console.log("Booking Data:", booking);
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  const showPrice = booking.price;
  const convenienceFee = showPrice * 0.18;

  const cgst = convenienceFee / 2;
  const sgst = convenienceFee / 2;

  const totalcgstsgst = cgst + sgst;

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      // console.log("UserID:", userId);

      const res = await fetch(`${BASE_URL}/user/create-show-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: finalAmount }),
      });

      const order = await res.json();

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      const options = {
        key: "rzp_test_SPANr2wS2zzuBp",

        amount: order.amount,

        currency: "INR",

        name: "Show Booking",

        description: booking.showTitle,

        order_id: order.id,

        handler: async function (response) {
          await fetch(`${BASE_URL}/user/save-show-booking`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              details: booking,
              paymentId: response.razorpay_payment_id,
              paymentStatus: "Success",
              totalAmount: finalAmount,
              userId: userId,
              convenienceFee: convenienceFee,
              type: "Show",
              cgst: cgst,
              sgst: sgst,
              Price: showPrice,
            }),
          });

          alert("Payment Successful 🎉");
          navigate("/user-bookings");
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.open();
    } catch (error) {
      console.log("Payment Error:", error);
    }
  };

  const finalAmount = showPrice + totalcgstsgst;

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
      {/* PAYMENT OPTIONS */}
      <div className="md:col-span-2 bg-white rounded shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Payment Options</h2>

        <div className="space-y-3">
          <button className="border p-4 w-full text-left rounded hover:border-red-500">
            Pay by any UPI App
          </button>

          <button className="border p-4 w-full text-left rounded">
            Debit / Credit Card
          </button>

          <button className="border p-4 w-full text-left rounded">
            Net Banking
          </button>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="bg-white rounded shadow p-5">
        <h3 className="font-semibold text-lg mb-3">{booking.showName}</h3>

        <p className="text-sm text-gray-500">
          {new Date(booking.showDate).toLocaleDateString()} | {booking.showTime}
        </p>

        <p className="text-sm text-gray-500 mb-3">{booking.theaterName}</p>

        <div className="border-t pt-3">
          {/* Ticket price */}
          <div className="flex justify-between mb-2">
            <span>Ticket(s) price</span>
            <span>₹{showPrice}</span>
          </div>

          {/* Convenience fee */}
          <div
            className="flex justify-between cursor-pointer"
            onClick={() => setShowFeeDetails(!showFeeDetails)}
          >
            <span>
              Convenience fees
              <span className="ml-1">⌄</span>
            </span>

            <span>₹{convenienceFee.toFixed(2)}</span>
          </div>

          {showFeeDetails && (
            <div className="text-sm text-gray-500 ml-3 mt-1">
              <div className="flex justify-between">
                <span>CGST @9%</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>SGST @9%</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
            <span>Amount Payable</span>

            <span>
              ₹{Number(finalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          className="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600"
          onClick={handlePayment}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default ShowPayment;
