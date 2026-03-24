import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../../../../../config";

const SeatArrangementPage = () => {
  const { id } = useParams();
  const location = useLocation();

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

  useEffect(() => {
    getBookedSeats();
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
    const res = await fetch(
      `${BASE_URL}/user/get-theater-layout/${theaterId}`,
    );

    const data = await res.json();
    // console.log(data)
    setTheaterName(data.theater_name);
    setHallName(data.halls[0].hall_name);
    setLayout(data.halls[0].seatCategories);
    setIsPreMeal(data.isPreMeal);
    getBookedSeats(data.theater_name);
  };

  const getBookedSeats = async () => {
    const res = await fetch(
      `${BASE_URL}/user/get-booked-seats?movieId=${id}&theaterId=${theaterId}&showDate=${selectedDate}&showTime=${selectedTimeSlot}`,
    );

    const data = await res.json();
    setSoldSeats(data);
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const toggleSeat = (seatId) => {
    if (soldSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= seatCount) return;
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalPrice = selectedSeats.reduce((total, seat) => {
    const catIndex = seat.split("-")[0];
    return total + layout[catIndex].price;
  }, 0);

  const handleSubmit = () => {
    if (selectedSeats.length === 0) {
      alert("Please select seats");
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
      theaterName,
      theaterId,
      hallName,
      seats: seatDetails,
      showDate: selectedDate,
      showTime: selectedTimeSlot,
      totalPrice,
    };

    // console.log("Booking Data:", bookingData);

    // condition based navigation
    if (isPreMeal) {
      navigate("/food-beverage", { state: bookingData });
    } else {
      navigate("/payment", { state: bookingData });
    }
  };

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

                            return (
                              <button
                                key={seatIndex}
                                disabled={isSold}
                                onClick={() => toggleSeat(seatId)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs rounded border
                ${
                  isSold
                    ? "bg-gray-400 text-white cursor-not-allowed"
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
      {selectedSeats.length > 0 && (
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
