import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../../config";
import { FaChevronUp } from "react-icons/fa";
import { Disclosure } from "@headlessui/react";

const ViewCancelBooking = () => {
      const [bookings, setBookings] = useState([]);
    
      useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${BASE_URL}/admin/get-cancelled-booked-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Network response was not OK");
            return res.json();
          })
          .then((data) => {
            setBookings(data);
          })
          .catch((err) => console.error("Fetch error:", err));
      }, []);

      return (
        <div className="p-6 text-white">
          {bookings.length === 0 ? (
            <p className="text-gray-400">No cancelled bookings found</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const hasFood = booking.foodItems && booking.foodItems.length > 0;

                const cancelledSeats =
                  booking.seats?.filter((s) => s.status === "Cancelled") || [];

                const foodTotal =
                  booking.foodItems?.reduce((sum, item) => sum + item.total, 0) ||
                  0;

                return (
                  <Disclosure key={booking._id}>
                    {({ open }) => (
                      <div className="bg-white text-black rounded-2xl shadow-md bbooking-l-4 bbooking-red-500">
                        <Disclosure.Button className="w-full p-4 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                🎬 {booking.movieTitle}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Booking ID: {booking._id}
                              </p>
                            </div>

                            {hasFood && (
                              <FaChevronUp
                                className={`w-5 h-5 transition ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>

                          <div className="mt-2 text-sm">
                            👤 {booking.userId?.name} <br />
                            📧 {booking.userId?.email}
                          </div>

                          <div className="mt-2 text-sm">
                            📅 {new Date(booking.showDate).toLocaleDateString()} |
                            ⏰ {booking.showTime}
                          </div>

                          <div className="mt-2 text-sm">
                            🏢 {booking.theaterId?.theater_name},{" "}
                            {booking.theaterId?.location_name}
                          </div>

                          {cancelledSeats.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-red-600">
                                Cancelled Seats
                              </p>

                              <div className="flex flex-wrap gap-2 mt-1">
                                {cancelledSeats.map((seat, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-red-100 text-red-500 rounded-full text-sm line-through"
                                  >
                                    {seat.seatId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 bg-gray-100 p-3 rounded-lg text-sm space-y-1">
                            <p>Total Paid: ₹{booking.totalAmount}</p>

                            {foodTotal > 0 && <p>Food: ₹{foodTotal}</p>}

                            {(booking.refundAmount ?? 0) > 0 && (
                              <p className="text-green-600 font-semibold">
                                💸 Refund: ₹{booking.refundAmount}
                              </p>
                            )}
                          </div>
                        </Disclosure.Button>

                        {hasFood && (
                          <Disclosure.Panel className="px-4 pb-4">
                            <div className="bg-gray-50 rounded-xl p-4 mt-2">
                              <h3 className="font-semibold text-gray-800 mb-2">
                                🍿 Food Items
                              </h3>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {booking.foodItems.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-2 rounded-lg shadow-sm text-sm flex justify-between"
                                  >
                                    <span>
                                      {item.name} × {item.quantity}
                                    </span>
                                    <span className="font-medium">
                                      ₹{item.total}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Disclosure.Panel>
                        )}
                      </div>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          )}
        </div>
      );
};

export default ViewCancelBooking;
