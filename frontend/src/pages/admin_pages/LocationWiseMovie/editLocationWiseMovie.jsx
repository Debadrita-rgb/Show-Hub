import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import BASE_URL from "../../../../config";

const EditLocationWiseMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [allTheaters, setAllTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [halls, setHalls] = useState([]);

  const [shows, setShows] = useState([]);

  const [isMultipleHall, setIsMultipleHall] = useState(false);

  const [formData, setFormData] = useState({
    movie: "",
    location: "",
    theater: "",
    hall_name: "",
    startDate: "",
    endDate: "",
    language: [],
  });

  /* ================= FETCH MOVIES ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/admin/get-movie`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const activeMovies = res.data.filter((m) => m.isActive);

        const movieList = activeMovies.map((m) => ({
          label: m.title,
          value: m._id,
          duration: m.totalTiming,
          language: m.language,
        }));
        setMovies(movieList);
      });
  }, []);

  /* ================= FETCH THEATERS ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/admin/get-theater`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
const activeTheaters = res.data.filter((t) => t.isActive);
setAllTheaters(activeTheaters);
        const uniqueLocations = [
          ...new Set(activeTheaters.map((t) => t.location_name)),
        ];
        setLocations(uniqueLocations);
      });
  }, []);

  /* ================= FETCH EXISTING DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(
          `${BASE_URL}/admin/get-single-locationwise-movie/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = res.data;

        setFormData({
          movie: data.movie?._id || data.movie,
          location: data.location,
          theater: data.theater?._id || data.theater,
          hall_name: data.hall_name || "",
          startDate: dayjs(data.startDate).format("YYYY-MM-DD"),
          endDate: dayjs(data.endDate).format("YYYY-MM-DD"),
          language: data.language || [],
        });

        setShows(data.shows || []);

        // Set theater list
        const filtered = allTheaters.filter(
          (t) =>
            t.location_name.toLowerCase().trim() ===
            data.location.toLowerCase().trim(),
        );
        setTheaters(filtered);

        const selected = filtered.find((t) => t._id === data.theater);

        if (selected?.isMultiple) {
          setIsMultipleHall(true);
          setHalls(selected.halls || []);
        }
      } catch {
        toast.error("Failed to fetch data");
      }
    };

    if (id && allTheaters.length) {
      fetchData();
    }
  }, [id, allTheaters]);

  useEffect(() => {
    if (!movies.length || !shows.length || !formData.movie) return;

    const updatedShows = shows.map((s) => ({
      startTime: s.startTime,
      endTime: calculateEndTime(s.startTime),
    }));

    setShows(updatedShows);
  }, [movies]);

  /* ================= CALCULATE END TIME ================= */
  const calculateEndTime = (startTime) => {
    const selectedMovie = movies.find((m) => m.value === formData.movie);
    if (!selectedMovie) return "";

    return dayjs(`1970-01-01T${startTime}`)
      .add(Number(selectedMovie.duration), "minute")
      .format("HH:mm");
  };

  /* ================= HANDLE SHOW ================= */
  const handleShowChange = (index, value) => {
    const updated = [...shows];

    const endTime = calculateEndTime(value);

    updated[index] = {
      startTime: value,
      endTime: endTime,
    };

    setShows(updated);
  };

  const addShow = () => {
    setShows([...shows, { startTime: "", endTime: "" }]);
  };

  const removeShow = (index) => {
    setShows(shows.filter((_, i) => i !== index));
  };

  // Get selectedMovie
  const selectedMovie = movies.find((m) => m.value === formData.movie);

  // Add and Remove Language Handlers
  const handleAddLanguage = (lang) => {
    if (!formData.language.includes(lang)) {
      setFormData((prev) => ({
        ...prev,
        language: [...prev.language, lang],
      }));
    }
  };

  const handleRemoveLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      language: prev.language.filter((l) => l !== lang),
    }));
  };

  /* ================= LOCATION ================= */
  const handleLocationChange = (e) => {
    const location = e.target.value;

    const filtered = allTheaters.filter(
      (t) =>
        t.location_name.toLowerCase().trim() === location.toLowerCase().trim(),
    );

    // check if previous theater exists in new location
    const isValidTheater = filtered.some((t) => t._id === formData.theater);

    setFormData((prev) => ({
      ...prev,
      location,
      theater: isValidTheater ? prev.theater : "", // ✅ keep or reset
      hall_name: "",
    }));

    setTheaters(filtered);

    // handle halls if still valid
    if (isValidTheater) {
      const selected = filtered.find((t) => t._id === formData.theater);

      if (selected?.isMultiple) {
        setIsMultipleHall(true);
        setHalls(selected.halls || []);
      } else {
        setIsMultipleHall(false);
        setHalls([]);
      }
    } else {
      setIsMultipleHall(false);
      setHalls([]);
    }
  };

  /* ================= THEATER ================= */
  const handleTheaterChange = (e) => {
    const theaterId = e.target.value;

    const selected = theaters.find((t) => t._id === theaterId); // ✅ correct

    setFormData((prev) => ({
      ...prev,
      theater: theaterId,
      hall_name: "",
    }));

    if (selected?.isMultiple) {
      setIsMultipleHall(true);
      setHalls(selected.halls || []);
    } else {
      setIsMultipleHall(false);
      setHalls([]);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/admin/update-locationwise-movie/${id}`,
        { ...formData, shows },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Updated successfully");

      setTimeout(() => {
        navigate("/admin/view-all-movie-selection");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="p-8">
      <ToastContainer />

      <form
        onSubmit={handleSubmit}
        className="w-full h-full bg-white p-10 border border-gray-200 rounded-xl shadow text-black"
      >
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
          {/* Movie */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Movie
            </label>
            <select
              name="movie"
              value={formData.movie}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  movie: e.target.value,
                  language: [],
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option value="">Select Movie</option>
              {movies.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* language  */}

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Movie Language
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.language.map((lang) => (
                <div
                  key={lang}
                  className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-full"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="ml-2 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <select
              onChange={(e) => handleAddLanguage(e.target.value)}
              name="movie"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option value="">Select Language</option>
              {selectedMovie?.language?.map((lang) => (
                <option
                  key={lang}
                  value={lang}
                  disabled={formData.language.includes(lang)}
                >
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Location
            </label>
            <select
              value={formData.location}
              onChange={handleLocationChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option value="">Select Location</option>
              {locations.map((loc, i) => (
                <option key={i} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          {/* Theater */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Theater
            </label>
            <select
              value={formData.theater}
              onChange={handleTheaterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option value="">Select Theater</option>
              {theaters.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.theater_name}
                </option>
              ))}
            </select>
          </div>
          {/* Hall */}
          {isMultipleHall && (
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Select Hall
              </label>
              <select
                value={formData.hall_name}
                onChange={(e) =>
                  setFormData({ ...formData, hall_name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              >
                <option value="">Select Hall</option>
                {halls.map((h, i) => (
                  <option key={i}>{h.hall_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Dates */}
          {/* Start Date */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
          </div>
          <div>
            {" "}
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
          </div>
        </div>
        {/* Shows */}
        {shows.map((show, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-14 gap-4 items-end mt-4 p-4 rounded-lg"
          >
            {/* Start Time */}
            <div className="md:col-span-5">
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={show.startTime}
                onChange={(e) => handleShowChange(index, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-black"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                End Time
              </label>
              <input
                type="time"
                value={show.endTime}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg text-black"
              />
            </div>
            <button
              type="button"
              onClick={() => removeShow(index)}
              className="bg-red-500 text-white px-3"
            >
              X
            </button>
          </div>
        ))}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={addShow}
            className="bg-green-600 text-white px-4 py-2 mb-4 mt-3"
          >
            + Add Show
          </button>
        </div>
        <br />

        <button className="bg-blue-600 text-white px-6 py-3">
          Update
        </button>
      </form>
    </div>
  );
};

export default EditLocationWiseMovie;
