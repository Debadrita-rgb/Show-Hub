import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocationcity } from "../../../../context/LocationContext";
import BASE_URL from "../../../../../config";

const TheaterList = ({ date, language, preferredTime, selectedDate }) => {
  const [allTheaters, setAllTheaters] = useState([]);

  const [theaters, setTheaters] = useState([]);
  const { id } = useParams();
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedTheaterId, setSelectedTheaterId] = useState(null);
  const [seatCount, setSeatCount] = useState(1);
  const [movie, setMovie] = useState(null);
  const navigate = useNavigate();
  const { city } = useLocationcity();

  const getTheaters = async () => {
    const formattedDate = selectedDate.toISOString();
    const queryCity = city && city !== "Detecting..." ? city : "";

    const res = await fetch(
      `${BASE_URL}/user/get-moviewise-theater/${id}?date=${formattedDate}&city=${queryCity}`,
    );

    const data = await res.json();
    // console.log(data)
    setAllTheaters(data);
    setTheaters(data);
  };

  useEffect(() => {
    if (id && selectedDate) {
      getTheaters();
    }
  }, [city, selectedDate, id]); //

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-single-movie/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
      });
  }, [id]);

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

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };

  const isShowPast = (startTime) => {
    const now = new Date();

    const showDateTime = new Date(selectedDate);
    const [h, m] = startTime.split(":");

    showDateTime.setHours(h, m, 0);

    return showDateTime < now;
  };

  // Apply filters separately

  useEffect(() => {
    let filtered = [...allTheaters];

    /* LANGUAGE FILTER */
    if (language) {
      filtered = filtered.filter((t) => t.language?.includes(language));
    }

    /* TIME FILTER */
    if (preferredTime) {
      filtered = filtered
        .map((theater) => {
          const filteredShows = theater.shows.filter((show) => {
            const hour = parseInt(show.startTime.split(":")[0]);

            if (preferredTime === "morning") return hour < 12;
            if (preferredTime === "afternoon") return hour >= 12 && hour < 16;
            if (preferredTime === "evening") return hour >= 16 && hour < 19;
            if (preferredTime === "night") return hour >= 19;

            return true;
          });

          return { ...theater, shows: filteredShows };
        })
        .filter((t) => t.shows.length > 0);
    }

    setTheaters(filtered);
  }, [language, preferredTime, allTheaters]);

  return (
    <div className="space-y-6">
      {theaters.map((theater) => (
        <div
          key={theater._id}
          className="border p-4 rounded-lg flex items-center justify-between"
        >
          {/* Left Side - Theater Info */}

          <div className="w-1/3">
            <div
              className="font-semibold text-lg cursor-pointer"
              onClick={() => setSelectedTheater(theater)}
            >
              {theater.theaterName} ({theater.language?.join(", ")})
            </div>

            {theater.hallName && (
              <div className="text-sm text-gray-500">{theater.hallName}</div>
            )}
          </div>

          {/* Right Side - Show Times */}
          <div className="flex gap-3 flex-wrap justify-start w-2/3">
            {theater.shows.map((show, i) => {
              // const now = new Date();

              // // create datetime using selected date
              // const showDateTime = new Date(selectedDate);

              // const [hours, minutes] = show.startTime.split(":");

              // showDateTime.setHours(parseInt(hours));
              // showDateTime.setMinutes(parseInt(minutes));
              // showDateTime.setSeconds(0);

              // const isPast = showDateTime < now;
              const isPast = isShowPast(show.startTime);

              return (
                <button
                  key={i}
                  disabled={isPast}
                  onClick={() => {
                    setSelectedTimeSlot(show.startTime);
                    setSelectedTheaterId(theater.theaterId);
                    setShowSeatModal(true);
                  }}
                  className={`px-4 py-2 border rounded
        ${
          isPast
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100 hover:text-black cursor-pointer"
        }`}
                >
                  {show.startTime}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedTheater && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[420px] shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold text-lg text-black">
                {selectedTheater.theaterName}
              </h2>

              <button
                onClick={() => setSelectedTheater(null)}
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Map */}
            <div className="p-4">
              <iframe
                title="map"
                width="100%"
                height="200"
                loading="lazy"
                className="rounded"
                src={`https://maps.google.com/maps?q=${selectedTheater.theaterName}&output=embed`}
              ></iframe>
            </div>

            {/* Address */}
            <div className="px-4 text-sm text-gray-600 flex items-start gap-2">
              📍 {selectedTheater.address || "Address not available"}
            </div>

            {/* Facilities */}
            <div className="p-4 border-t">
              <p className="font-semibold mb-2">Available Facilities</p>
              <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                {selectedTheater?.theater?.isPreMeal && (
                  <div>🍿 Food & Beverages</div>
                )}

                <div>📱 M-Ticket</div>

                {selectedTheater?.theater?.isParkingFacility && (
                  <div>🚗 Parking</div>
                )}

                {selectedTheater?.theater?.isFoodCourt && (
                  <div>🍴 Food Court</div>
                )}

                {selectedTheater?.theater?.isWheelChairFacility && (
                  <div>♿ Wheelchair Facility</div>
                )}
              </div>

              {/* <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                <div>🍿 Food & Beverages</div>
                <div>📱 M-Ticket</div>
                <div>🚗 Parking</div>
                <div>🍴 Food Court</div>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {showSeatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-[90%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] text-center relative">
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
              src={seatImages[seatCount]}
              alt="Vehicle"
              className="mx-auto mb-4 w-40 h-40 object-contain"
            />

            <div className="flex flex-wrap justify-center">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSeatCount(i + 1);

                    navigate(
                      `/movie/${createSlug(movie.title)}/${id}/book-movie/seat-arrangement`,
                      {
                        state: {
                          selectedDate,
                          selectedTimeSlot,
                          theaterId: selectedTheaterId,
                          seatCount: i + 1,
                        },
                      },
                    );
                  }}
                  className={`bg-gray-100 hover:bg-gray-200 text-black font-light py-2 px-4 rounded-xl shadow-lg m-1 ${
                    seatCount === i + 1 ? "ring-2 ring-black" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <hr className="my-4" />

            {/* <h6 className="text-xl font-bold text-black">Seat Price: ₹100</h6> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterList;
