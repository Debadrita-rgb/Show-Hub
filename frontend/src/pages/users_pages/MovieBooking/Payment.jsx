import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "../../../../config";

const Payment = () => {
  const location = useLocation();
  const { state } = useLocation();
const navigate = useNavigate();
  const booking = location.state;
  // console.log("Booking Data:", state);
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  const ticketPrice = booking.totalPrice;

  const foodTotal =
    booking.foodItems?.reduce((sum, item) => sum + item.price * item.qty, 0) ||
    0;
 
  const subtotal = ticketPrice + foodTotal;

  const convenienceFee = subtotal * 0.18;

  const cgst = convenienceFee / 2;
  const sgst = convenienceFee / 2;

  const totalcgstsgst = cgst + sgst;

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      // console.log("UserID:", userId);

      const res = await fetch(`${BASE_URL}/user/create-order`, {
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

        name: "Movie Booking",

        description: booking.movieTitle,

        order_id: order.id,

        handler: async function (response) {
          await fetch(`${BASE_URL}/user/save-booking`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...booking,
              // seats: booking.selectedSeats,
              // foodItems: booking.cart,
              paymentId: response.razorpay_payment_id,
              paymentStatus: "Success",
              totalAmount: finalAmount,
              userId: userId,
              convenienceFee: convenienceFee,
              type: "Movie",
              cgst: cgst,
              sgst: sgst,
              ticketPrice: ticketPrice,
              foodTotal: foodTotal,
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

  const baseAmount = booking.grandTotal ?? booking.totalPrice ?? 0;

  const finalAmount = baseAmount + totalcgstsgst;

  // console.log("Final Amount:", finalAmount);

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
        <h3 className="font-semibold text-lg mb-3">{booking.movieTitle}</h3>

        <p className="text-sm text-gray-500">
          {new Date(booking.showDate).toLocaleDateString()} | {booking.showTime}
        </p>

        <p className="text-sm text-gray-500 mb-3">{booking.theaterName}</p>

        <div className="border-t pt-3">
          {/* Ticket price */}
          <div className="flex justify-between mb-2">
            <span>Ticket(s) price</span>
            <span>₹{ticketPrice}</span>
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

          {/* Food section */}
          {booking.foodItems?.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-sm mb-1">Food & Beverage</h4>

              {booking.foodItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>

                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
            <span>Amount Payable</span>

            <span>₹{Number(finalAmount).toFixed(2)}</span>
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

export default Payment;
