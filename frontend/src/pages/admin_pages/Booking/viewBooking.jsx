import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Disclosure } from "@headlessui/react";
import { FaChevronUp } from "react-icons/fa";
import BASE_URL from "../../../../config";

const ViewBooking = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("Movie");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/admin/get-booked-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not OK");
        return res.json();
      })
      .then((data) => {
        setMovies(data);
        setFilteredMovies(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  
  useEffect(() => {
    let filtered = movies.filter((item) => item.type === activeTab);

    if (selectedDate) {
      const selected = selectedDate.toLocaleDateString("sv-SE");

      filtered = filtered.filter((order) => {
        const dateField =
          order.type === "Movie"
            ? new Date(order.showDate).toISOString().split("T")[0]
            : order.details?.date;

        return dateField === selected;
      });
    }

    setFilteredMovies(filtered);
  }, [selectedDate, movies, activeTab]);

  return (
    <div className="p-6 text-white">
      <div className="mb-4">
        <label className="text-sm text-white mr-2 font-semibold border-amber-50">
          Filter by Date:
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select a date"
          className="px-3 py-1 rounded text-white border border-amber-50"
          isClearable
          showPopperArrow={false}
        />
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative flex bg-gray-800 rounded-full p-1 w-full max-w-xs sm:max-w-sm">
          {" "}
          {/* Sliding Background */}
          <div
            className={`absolute top-1 bottom-1 w-1/2 rounded-full transition-all duration-300 ${
              activeTab === "Movie"
                ? "left-1 bg-blue-500"
                : "left-1/2 bg-purple-500"
            }`}
          ></div>
          <button
            onClick={() => setActiveTab("Movie")}
            className="relative z-10 w-1/2 py-2 text-sm font-semibold text-white"
          >
            🎬 Movies
          </button>
          <button
            onClick={() => setActiveTab("Show")}
            className="relative z-10 w-1/2 py-2 text-sm font-semibold text-white"
          >
            🎭 Shows
          </button>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <p className="text-gray-300">No bookings found for selected date.</p>
      ) : (
        filteredMovies.map((order) => (
          <Disclosure key={order._id}>
            {({ open }) => {
              const hasFood = order.foodItems && order.foodItems.length > 0;
              return (
                <div>
                  <Disclosure.Button className="mt-4 w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition p-3 sm:p-4 text-black">
                    {" "}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {" "}
                      {/* LEFT */}
                      <div className="space-y-2">
                        {" "}
                        <h2 className="text-base sm:text-lg font-semibold text-[#1b4c6d] break-words">
                          {" "}
                          🎬{" "}
                          {order.type === "Movie"
                            ? order.movieTitle
                            : order.details?.showTitle}{" "}
                        </h2>
                        <p className="text-xs text-gray-400">
                          Booking ID: {order._id}
                        </p>
                        <p className="text-sm">
                          👤{" "}
                          <span className="font-medium">
                            {order.userId?.name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          📧 {order.userId?.email}
                        </p>
                        {/* STATUS BADGE */}
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full font-semibold mt-1 ${
                            order.paymentStatus === "Success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      {/* RIGHT */}
                      <div className="space-y-3">
                        {" "}
                        <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                          {" "}
                          <span>
                            📅{" "}
                            {order.type === "Movie"
                              ? new Date(order.showDate).toLocaleDateString()
                              : order.details?.date}
                          </span>
                          <span>
                            ⏰{" "}
                            {order.type === "Movie"
                              ? order.showTime
                              : order.details?.startTime}
                          </span>
                        </div>
                        <p className="text-sm break-words">
                          🏢{" "}
                          {order.type === "Movie"
                            ? order.hallName
                              ? `${order.hallName} (${order.theaterName}, ${order.locationName})`
                              : `${order.theaterName}, ${order.locationName}`
                            : `${order.details?.theaterName}, ${order.details?.locationName}`}
                        </p>
                        {/* PRICE BOX */}
                        <div className="max-w-4xl mx-auto">
                          <div className="bg-gray-100 p-3 rounded-lg text-sm space-y-1">
                            {" "}
                            <p>
                              🎟 Ticket: ₹
                              {order.type === "Movie"
                                ? order.ticketPrice
                                : order.details?.price}
                            </p>{" "}
                            <p>💸 Fee: ₹{order.convenienceFee}</p>
                            <p>
                              🧾 Food Total Price: ₹
                              {order.foodItems.reduce(
                                (sum, item) => sum + item.total,
                                0,
                              )}
                            </p>
                            <p className="font-semibold text-[#1b4c6d]">
                              Total: ₹{order.totalAmount}
                            </p>
                          </div>
                        </div>
                        {/* SEATS (chips style) */}
                        {order.type === "Movie" && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              🎟️ Seats
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {" "}
                              {order.seats.map((seat, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center justify-center px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                                >
                                  <span className="text-sm font-semibold text-blue-600">
                                    {seat.seatId}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {seat.category}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* ICON */}
                    {hasFood && order.type === "Movie" && (
                      <FaChevronUp
                        className={`${open ? "rotate-180 transform" : ""} w-5 h-5 transition`}
                      />
                    )}
                  </Disclosure.Button>
                  {hasFood && (
                    <Disclosure.Panel className="mt-2 bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        🍿 Food Items
                      </h3>

                      {order.foodItems.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {" "}
                          {order.foodItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-2 rounded-lg shadow-sm text-sm flex justify-between text-black"
                            >
                              <span>
                                {item.name} × {item.quantity}
                              </span>
                              <span className="font-medium">₹{item.total}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No food items selected
                        </p>
                      )}
                    </Disclosure.Panel>
                  )}
                </div>
              );
            }}
          </Disclosure>
        ))
      )}
    </div>
  );
};

export default ViewBooking;
