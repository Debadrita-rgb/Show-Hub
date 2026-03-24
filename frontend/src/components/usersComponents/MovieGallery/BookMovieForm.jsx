  import React, { useEffect, useState } from "react";
  import { useLocation, useParams, useNavigate } from "react-router-dom";
  import axios from "axios";
  import moment from "moment";

  const BookMovieForm = () => {
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [seatCount, setSeatCount] = useState(1);
    const { state } = useLocation();
    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const [selectedDate, setSelectedDate] = useState(
      moment().add(1, "days").format("YYYY-MM-DD")
    );
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [stage, setStage] = useState(1); 
    const navigate = useNavigate();
    const [showSeatModal, setShowSeatModal] = useState(false);

    const [formData, setFormData] = useState({
      userId: state?.userId || "",
      name: state?.name || "",
      email: state?.email || "",
      requirements: "",
      status: "booking",
      movieId: movieId,
      bookingdate: "",
    });

    useEffect(() => {
      const fetchMovie = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/voyager/get-single-movie/${movieId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMovie(res.data);
          
          if (res.data.showtimeslot && res.data.showtimeslot.length > 0) {
            setSelectedTimeSlot(res.data.showtimeslot[0]);
          }
        } catch (error) {
          console.error("Failed to fetch movie:", error);
          // Optionally show an error message or toast here
        }
      };

      fetchMovie();
    }, [movieId]);

    const seatImages = {
      1: "https://cdn-icons-png.freepik.com/512/1210/1210492.png",
      2: "https://www.svgrepo.com/show/476924/scooter.svg",
      3: "https://www.svgrepo.com/show/395796/auto-rickshaw.svg",
      4: "https://www.svgrepo.com/show/395796/auto-rickshaw.svg",
      5: "https://i.pinimg.com/474x/ff/33/56/ff3356160fb40709866d07a1f88c43f0.jpg",
      6: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg_RFgTGYfownnkwxoTDU8YKAAOKgU7i7wyA&s",
      7: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg_RFgTGYfownnkwxoTDU8YKAAOKgU7i7wyA&s",
      8: "https://static.vecteezy.com/system/resources/previews/047/520/610/non_2x/realistic-vehicle-concept-illustration-vector.jpg",
      9: "https://static.vecteezy.com/system/resources/previews/047/520/610/non_2x/realistic-vehicle-concept-illustration-vector.jpg",
      10: "https://static.vecteezy.com/system/resources/previews/047/520/610/non_2x/realistic-vehicle-concept-illustration-vector.jpg",
    };

    const currentImage =
      seatImages[seatCount] ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEHYNPoFDvarwoIY-r4as14ZzCbRRhtUDCJA&s";

    if (!movie) return <div>Loading...</div>;
    const seatPrice = movie?.moviePrice || 0;

    return (
      <section className="px-6 md:px-16 py-16 relative">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-white">Book Movie Ticket</h2>
        </div>

        {/* --- DATE SELECTOR --- */}
        {stage >= 1 && (
          <div className="mb-6 bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl">
            <h2 className="text-white font-semibold text-xl mb-2">
              Movie: {movie.title}
            </h2>
            <label className="text-white">Select Date:</label>
            <div>
              <label>Select Date: </label>
              <input
                type="date"
                min={moment().format("YYYY-MM-DD")}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-amber-50 rounded-3xl p-3"
                required
              />
            </div>
          </div>
        )}

        {/* --- TIME SLOT SELECTOR --- */}
        {stage >= 1 && (
          <div className="mb-6 bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl">
            <h3 className="text-white font-semibold mb-2">Choose Time Slot</h3>
            {movie.showtimeslot.map((slot) => (
              <button
                key={slot.id}
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  setSelectedTimeSlot(slot);
                  const res = await axios.get(
                    `http://localhost:5000/voyager/get-booked-seats/${movieId}?date=${selectedDate}&timeSlotId=${
                      slot.time || slot
                    }`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setBookedSeats(res.data.bookedSeats);
                  setSelectedSeats([]);
                  setStage(2);
                  setShowSeatModal(true);
                }}
                className={`${
                  selectedTimeSlot?.id === slot.id
                    ? "bg-cyan-500"
                    : "bg-green-400 hover:bg-cyan-500"
                } text-black font-bold py-2 px-6 rounded-xl shadow-lg mr-2`}
              >
                {slot.time || slot}
              </button>
            ))}
          </div>
        )}

        {showSeatModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 w-full max-w-4xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl text-center relative">
              <button
                className="absolute top-3 right-5 text-black text-xl"
                onClick={() => setShowSeatModal(false)}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold mb-4 text-black">
                How many seats?
              </h3>
              <img
                src={
                  seatImages[seatCount] ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEHYNPoFDvarwoIY-r4as14ZzCbRRhtUDCJA&s"
                }
                alt="Vehicle"
                className="mx-auto mb-4 w-40 h-40 object-contain bg-white"
              />
              <div className="flex flex-wrap justify-center">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSeatCount(i + 1);
                      setSelectedSeats([]);
                      navigate(
                        `/services/facilities/movies/book-movie/${movieId}/select-seats`,
                        {
                          state: {
                            selectedDate,
                            selectedTimeSlot,
                            seatCount: i + 1,
                            bookedSeats,
                          },
                        }
                      );
                    }}
                    className={`bg-cyan-400 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded-xl shadow-lg m-1 ${
                      seatCount === i + 1 ? "ring-2 ring-black" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <hr></hr>
              <div className="text-center relative text-black mt-5">
                <h3 className="text-xl font-bold mb-4 text-black">Seat Price:  ₹{seatPrice}</h3>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  };

  export default BookMovieForm;
