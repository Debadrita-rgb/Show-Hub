import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../../../../../config";
import { jwtDecode } from "jwt-decode";
import useLockHandler from "../../../../hooks/useLockHandler";

const SeatArrangementPage = () => {
  const { id } = useParams();
  const location = useLocation();
    useLockHandler();
  const { selectedDate, selectedTimeSlot, seatCount, theaterId } =
    location.state || {};
  const [layout, setLayout] = useState([]);
  const [theaterName, setTheaterName] = useState("");
  const [hallName, setHallName] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [movie, setMovies] = useState({});
  const navigate = useNavigate();
  const [isPreMeal, setIsPreMeal] = useState(false);
  const [soldSeats, setSoldSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  useEffect(() => {
    if (theaterId && selectedDate && selectedTimeSlot) {
      getBookedSeats();
    }
  }, [theaterId, selectedDate, selectedTimeSlot]);
  useEffect(() => {
    const interval = setInterval(() => {
      getBookedSeats();
    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.expired) {
      alert("⚠️ Your session expired. Please select seats again.");
    }
  }, []);
  useEffect(() => {
    fetch(`${BASE_URL}/user/get-single-movie/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
      });
  }, [id]);

  useEffect(() => {
    getLayout();
  }, []);

  
  const getLayout = async () => {
    const res = await fetch(`${BASE_URL}/user/get-theater-layout/${theaterId}`);

    const data = await res.json();
    // console.log(data)
    setTheaterName(data.theater_name);
    setHallName(data.halls[0].hall_name);
    setLayout(data.halls[0].seatCategories);
    setIsPreMeal(data.isPreMeal);
    if (data.expiresAt) {
      localStorage.setItem("lockExpiry", data.expiresAt);
    }
    // getBookedSeats(data.theater_name);
  };

  const getBookedSeats = async () => {
    const res = await fetch(
      `${BASE_URL}/user/get-booked-seats?movieId=${id}&theaterId=${theaterId}&showDate=${selectedDate}&showTime=${selectedTimeSlot}`,
    );

    const data = await res.json();
    // setSoldSeats(data);
    setSoldSeats(data.bookedSeats);
    setLockedSeats(data.lockedSeats);
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const toggleSeat = async (seatId) => {
    if (soldSeats.includes(seatId) || lockedSeats.includes(seatId)) return;

    let updatedSeats;

    if (selectedSeats.includes(seatId)) {
      updatedSeats = selectedSeats.filter((s) => s !== seatId);
    } else {
      if (selectedSeats.length >= seatCount) return;
      updatedSeats = [...selectedSeats, seatId];
    }

    setSelectedSeats(updatedSeats);
    // console.log("Seats sending:", updatedSeats);

    if (updatedSeats.length === seatCount) {
      await lockSeats(updatedSeats);
    }
  };

  const totalPrice = selectedSeats.reduce((total, seat) => {
    const catIndex = seat.split("-")[0];
    return total + layout[catIndex].price;
  }, 0);

    const lockSeats = async (seatsToLock) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const decoded = jwtDecode(token);

      const res = await fetch(`${BASE_URL}/user/lock-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: id,
          theaterId,
          showDate: selectedDate,
          showTime: selectedTimeSlot,
          seats: seatsToLock,
          userId: decoded.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        setSelectedSeats([]); // reset
        return;
      }

      localStorage.setItem("lockExpiry", data.expiresAt);
      localStorage.setItem("lockId", data.lockId);
      localStorage.setItem("lockStatus", data.lockStatus);

    };

  const handleSubmit = async () => {
    if (selectedSeats.length !== seatCount) {
      alert(`Please select exactly ${seatCount} seats`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    // GET FROM LOCAL STORAGE (already saved during lock)
    const lockId = localStorage.getItem("lockId");
    const expiresAt = localStorage.getItem("lockExpiry");

    if (!lockId || !expiresAt) {
      alert("Session expired. Please select seats again.");
      navigate(`/movie/${id}/book-movie/seat-arrangement`);
      return;
    }

    const seatDetails = selectedSeats.map((seat) => {
      const catIndex = seat.split("-")[0];

      return {
        seatId: seat,
        category: layout[catIndex].seat_name,
        price: layout[catIndex].price,
      };
    });

    const bookingData = {
      movieId: movie?._id,
      movieTitle: movie?.title,
      slug: movie?.title?.toLowerCase().replace(/\s+/g, "-"),
      theaterName,
      theaterId,
      hallName,
      seats: seatDetails,
      showDate: selectedDate,
      showTime: selectedTimeSlot,
      totalPrice,
      expiresAt,
      lockId, 
    };

    if (isPreMeal) {
      // nextPathRef.current = "/food-beverage"; // ✅ TRACK NEXT PAGE
      navigate("/food-beverage", { state: bookingData });
    } else {
      // nextPathRef.current = "/payment"; // ✅ TRACK NEXT PAGE
      navigate("/payment", { state: bookingData });
    }
  };

  useEffect(() => {
    const expiry = localStorage.getItem("lockExpiry");

    if (expiry && new Date(expiry) < new Date()) {
      localStorage.removeItem("lockId");
      localStorage.removeItem("lockExpiry");
    }
  }, []);

  return (
    <div className="min-h-screen flex justify-center px-3 pt-6">
      <div className="w-full max-w-5xl  p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Left Section */}
          <div>
            <h1 className="text-xl font-bold text-white"> {movie?.title}</h1>

            <p className="text-sm text-gray-300">
              {theaterName} | {hallName && ` | ${hallName}`}
            </p>

            <div className="mt-2 inline-block border border-gray-400 px-3 py-1 rounded text-sm text-white">
              {new Date(selectedDate).toLocaleDateString()} | {selectedTimeSlot}
            </div>
          </div>

          {/* Right Section */}
          <div className="mt-4 sm:mt-0">
            <div className="border border-gray-400 px-4 py-2 rounded text-white text-sm text-center">
              {seatCount} Seats
            </div>
          </div>
        </div>

        <div className="overflow-x-auto lg:overflow-x-visible w-full">
          <div className="min-w-[600px] lg:min-w-full">
            {/* Seat Categories */}
            {layout.map((category, catIndex) => (
              <div key={catIndex} className="mb-8">
                <h2 className="text-center text-white mb-4 text-sm sm:text-base">
                  ₹{category.price} {category.seat_name}
                </h2>

                {[...Array(category.totalRows)].map((_, rowIndex) => {
                  const rowLetter = alphabet[rowIndex];

                  return (
                    <div
                      key={rowIndex}
                      className="flex items-center justify-center gap-2 sm:gap-4 mb-2"
                    >
                      {/* Row Label */}
                      <div className="w-5 sm:w-6 text-white text-xs sm:text-sm">
                        {rowLetter}
                      </div>

                      {/* Seats */}
                      <div className="flex gap-1 sm:gap-2 pb-1 whitespace-nowrap">
                        {[...Array(category.seatsPerRow)].map(
                          (_, seatIndex) => {
                            const seatId = `${catIndex}-${rowLetter}-${seatIndex + 1}`;
                            const isSelected = selectedSeats.includes(seatId);
                            const isSold = soldSeats.includes(seatId);
                            const isLocked = lockedSeats.includes(seatId);

                            return (
                              <button
                                key={seatIndex}
                                disabled={isSold || isLocked}
                                title={
                                  isLocked
                                    ? "Seat locked"
                                    : isSold
                                      ? "Seat booked"
                                      : ""
                                }
                                onClick={() => toggleSeat(seatId)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs rounded border transition-all duration-200
                ${
                  isSold
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : isLocked
                      ? "bg-yellow-400 text-black cursor-not-allowed hover:scale-105"
                      : isSelected
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-black text-white hover:bg-green-100 hover:text-black"
                }
              `}
                              >
                                {seatIndex + 1}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Screen */}
        <div className="mt-10 text-center">
          <div className="bg-gray-300 h-2 w-3/4 sm:w-2/3 mx-auto rounded"></div>
          <p className=" mt-2 text-sm text-white">SCREEN</p>
        </div>

        {/* Legend */}
        <div className="flex justify-center flex-wrap gap-4 sm:gap-6 mt-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-green-500"></div>
            Available
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            Selected
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400"></div>
            Sold
          </div>
        </div>
      </div>
      {selectedSeats.length === seatCount && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t p-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            {/* Seat Info */}
            <div>
              <p className="text-sm text-gray-500">
                {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""}{" "}
                Selected
              </p>
              <p className="font-semibold text-lg text-black">₹{totalPrice}</p>
            </div>

            {/* Pay Button */}
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
              onClick={handleSubmit}
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatArrangementPage;
