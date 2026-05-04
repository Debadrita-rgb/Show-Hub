import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Disclosure } from "@headlessui/react";
import { FaChevronUp } from "react-icons/fa";
import { useParams } from "react-router-dom";
import TheatreList from "./TheaterList"
import BASE_URL from "../../../../../config";
 

const MovieFirst = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [language, setLanguage] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  useEffect(() => {
    getMovie();
  }, []);

  const getMovie = async () => {
    const res = await fetch(`${BASE_URL}/user/get-single-movie/${id}`);
    const data = await res.json();
    // console.log(data);
    setMovie(data);
  };

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();

const formatDuration = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;

  return `${hrs}h ${mins}m`;
};
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-semibold mb-3 text-white">
        {movie.title}
      </h1>
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
        <span className="text-xs md:text-sm text-white border border-gray-300 px-2 py-1 rounded-md">
          Movie runtime: {formatDuration(movie.totalTiming)}
        </span>

        {movie.category?.map((cat, i) => (
          <span
            key={i}
            className="border border-gray-300 text-xs md:text-sm px-2 py-1 rounded-md"
          >
            {cat}
          </span>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-y py-4 mb-6 gap-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dates.map((date, index) => (
            <div
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`min-w-[70px] cursor-pointer px-3 py-2 text-center rounded-md border text-black
          ${
            selectedDate?.toDateString() === date.toDateString()
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-white"
          }`}
            >
              <p className="text-xs">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </p>

              <p className="font-semibold">{date.getDate()}</p>

              <p className="text-xs">
                {date.toLocaleDateString("en-US", { month: "short" })}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="" className="text-black">
              All Language
            </option>
            {movie.language?.map((lan, i) => (
              <option key={i} value={lan} className="text-black">
                {lan}
              </option>
            ))}
          </select>

          <select
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="" className="text-black">All Time</option>
            <option value="morning" className="text-black">
              Morning (12AM - 11:59AM)
            </option>
            <option value="afternoon" className="text-black">
              Afternoon (12PM - 03:59PM)
            </option>
            <option value="evening" className="text-black">
              Evening (04PM - 06:59PM)
            </option>
            <option value="night" className="text-black">
              Night (07PM - 11:59PM)
            </option>
          </select>
        </div>
      </div>
      <TheatreList
        selectedDate={selectedDate}
        language={language}
        preferredTime={preferredTime}
      />{" "}
    </div>
  );
};

export default MovieFirst;
