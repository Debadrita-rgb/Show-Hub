import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../../config";

const AddLocationWiseMovie = () => {
  const navigate = useNavigate();

  const [allTheaters, setAllTheaters] = useState([]);
  const [shows, setShows] = useState([
    {
      startTime: "",
      endTime: "",
    },
  ]);
  const [movies, setMovies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [halls, setHalls] = useState([]);

  const [isMultipleHall, setIsMultipleHall] = useState(false);

  const [formData, setFormData] = useState({
    movie: "",
    location: "",
    theater: "",
    hall_name: "",
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
    isMultiple: false,
    language: [],
  });


  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/admin/get-movie`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      })
      .catch(() => toast.error("Failed to fetch movies"));
  }, []);

  const selectedMovie = movies.find((m) => m.value === formData.movie);

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/admin/get-theater`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const activeTheaters = res.data.filter((t) => t.isActive);
        setAllTheaters(activeTheaters);

        const uniqueLocations = [
          ...new Set(activeTheaters.map((t) => t.location_name)),
        ];

        setLocations(uniqueLocations);
      })
      .catch(() => toast.error("Failed to fetch theaters"));
  }, []);

  const calculateEndTime = (startTime) => {
    const selectedMovie = movies.find((m) => m.value === formData.movie);

    if (!selectedMovie) return "";

    const duration = Number(selectedMovie.duration);

    return dayjs(`1970-01-01T${startTime}`)
      .add(duration, "minute")
      .format("HH:mm");
  };

  const handleShowChange = (index, value) => {
    const updatedShows = [...shows];

    let newStart = dayjs(`1970-01-01T${value}`);
    let newEnd = dayjs(`1970-01-01T${calculateEndTime(value)}`);

    if (newEnd.isBefore(newStart)) {
      newEnd = newEnd.add(1, "day");
    }

    if (index > 0) {
      const prevShow = shows[index - 1];

      if (prevShow.endTime) {
        let prevEnd = dayjs(`1970-01-01T${prevShow.endTime}`);

        const allowedStart = prevEnd.add(30, "minute");

        if (newStart.isBefore(allowedStart)) {
          toast.error(
            `Previous show ends at ${prevShow.endTime}. Next show can start after 20 minutes (${allowedStart.format(
              "HH:mm",
            )})`,
          );
          return;
        }
      }
    }

    for (let i = 0; i < shows.length; i++) {
      if (i === index) continue;

      const show = shows[i];
      if (!show.startTime || !show.endTime) continue;

      let start = dayjs(`1970-01-01T${show.startTime}`);
      let end = dayjs(`1970-01-01T${show.endTime}`);

      if (end.isBefore(start)) {
        end = end.add(1, "day");
      }

      if (newStart.isBefore(end) && newEnd.isAfter(start)) {
        toast.error(
          `Show overlaps with another show (${show.startTime} - ${show.endTime})`,
        );
        return;
      }
    }

    updatedShows[index] = {
      startTime: value,
      endTime: calculateEndTime(value),
    };

    setShows(updatedShows);
  };

  const addShow = () => {
    const lastShow = shows[shows.length - 1];

    if (!lastShow.endTime) {
      toast.error("Select start time first");
      return;
    }

    const nextStart = dayjs(`1970-01-01T${lastShow.endTime}`)
      .add(20, "minute")
      .format("HH:mm");

    setShows([
      ...shows,
      {
        startTime: nextStart,
        endTime: calculateEndTime(nextStart),
      },
    ]);
  };

  const removeShow = (index) => {
    const updated = shows.filter((_, i) => i !== index);
    setShows(updated);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "movie") {
        updated.language = [];
      }

      if (
        (name === "movie" || name === "startTime") &&
        updated.movie &&
        updated.startTime
      ) {
        const selectedMovie = movies.find((m) => m.value === updated.movie);

        if (selectedMovie) {
          const duration = Number(selectedMovie.duration);

          const end = dayjs(`1970-01-01T${updated.startTime}`)
            .add(duration, "minute")
            .format("HH:mm");

          updated.endTime = end;
        }
      }

      return updated;
    });
  };

  const handleLocationChange = (e) => {
    const location = e.target.value;

    setFormData({
      ...formData,
      location,
      theater: "",
      hall_name: "",
    });

    const filtered = allTheaters.filter(
      (t) =>
        t.location_name.toLowerCase().trim() === location.toLowerCase().trim(),
    );

    setTheaters(filtered);
  };


  const handleTheaterChange = (e) => {
    const theaterId = e.target.value;

    const selected = theaters.find((t) => t._id === theaterId);

    setFormData({
      ...formData,
      theater: theaterId,
      hall_name: "",
      isMultiple: selected?.isMultiple || false,
    });

    if (selected?.isMultiple) {
      setIsMultipleHall(true);
      setHalls(selected.halls || []);
    } else {
      setIsMultipleHall(false);
      setHalls([]);
    }
  };


  const hasOverlap = (shows) => {
    for (let i = 0; i < shows.length; i++) {
      for (let j = i + 1; j < shows.length; j++) {
        const start1 = dayjs(`1970-01-01T${shows[i].startTime}`);
        const end1 = dayjs(`1970-01-01T${shows[i].endTime}`);

        const start2 = dayjs(`1970-01-01T${shows[j].startTime}`);
        const end2 = dayjs(`1970-01-01T${shows[j].endTime}`);

        if (start1.isBefore(end2) && end1.isAfter(start2)) {
          toast.error(
            `Show overlaps (${shows[i].startTime}-${shows[i].endTime})`,
          );
          return true;
        }
      }
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasOverlap(shows)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        shows,
      };

      const res = await axios.post(
        `${BASE_URL}/admin/add-locationwise-movie`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Show added successfully");

      setTimeout(() => {
        navigate("/admin/view-all-movie-selection");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Add Show");
    }
  };
  return (
    <div className="p-8">
      <ToastContainer position="top-right" autoClose={2000} />

      <form
        onSubmit={handleSubmit}
        className="w-full h-full bg-white p-10 border border-gray-200 rounded-xl shadow"
      >
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
          {" "}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Movie
            </label>

            <select
              name="movie"
              value={formData.movie}
              label="Select Movie"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              required
            >
              <option value="">Select Movie</option>

              {movies.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Language
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
                    className="ml-2 text-white font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <select
              name="language"
              onChange={(e) => handleAddLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option value="">Select Language</option>

              {selectedMovie?.language?.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Location
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              required
            >
              <option value="">Select Location</option>

              {locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Theater
            </label>
            <select
              name="theater"
              value={formData.theater}
              onChange={handleTheaterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              required
            >
              <option value="">Select Theater</option>

              {theaters.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.theater_name}
                </option>
              ))}
            </select>
          </div>
          {isMultipleHall && (
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Select Hall
              </label>
              <select
                name="hall_name"
                value={formData.hall_name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                required
              >
                <option value="">Select Hall</option>

                {halls.map((h, index) => (
                  <option key={index} value={h.hall_name}>
                    {h.hall_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              required
            />
          </div>
        </div>

        {shows.map((show, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-14 gap-4 items-end mt-4 border p-4 rounded-lg"
          >
            <div className="md:col-span-5">
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={show.startTime}
                onChange={(e) => handleShowChange(index, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-black"
                required
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
                className="w-full p-3 border bg-gray-100 border-gray-300 rounded-lg text-black"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addShow}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg"
              >
                + Add
              </button>
            </div>

            <div className="md:col-span-2">
              {shows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeShow(index)}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          Save Show
        </button>
      </form>
    </div>
  );
};

export default AddLocationWiseMovie;
