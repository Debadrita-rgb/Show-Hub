import React, { useEffect, useState } from "react";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const AddLocationWiseMovie = () => {
  const [allTheaters, setAllTheaters] = useState([]);

  const [formData, setFormData] = useState({
    movie: "",
    location: "",
    theater: "",
    hall_name: "",
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
  });
  const [fields, setFields] = useState([]);

  const [movies, setMovies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [halls, setHalls] = useState([]);
  const [isMultipleHall, setIsMultipleHall] = useState(false);

  // Fetch Movies

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/admin/get-movie", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMovies(
          res.data.map((m) => ({
            label: m.title,
            value: m._id,
            duration: m.totalTiming,
          })),
        );
      });
  }, []);

  // Fetch Theaters & Locations
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/admin/get-theater", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data;
        setAllTheaters(res.data);

        const uniqueLocations = [...new Set(data.map((t) => t.location_name))];

        setLocations(
          uniqueLocations.map((loc) => ({
            label: loc,
            value: loc,
          })),
        );
      });
  }, []);

  // When Theater Changes
  useEffect(() => {
    if (!formData.theater) return;

    const selected = theaters.find((t) => t.value === formData.theater);

    if (selected?.isMultiple) {
      setHalls(
        selected.halls.map((h) => ({
          label: h.hall_name,
          value: h.hall_name,
        })),
      );
    } else {
      setHalls([]);
    }
  }, [formData.theater]);

  
const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const updated = { ...prev, [name]: value };

    // Calculate endTime when movie or startTime changes
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

  // Dynamic Fields Config
  useEffect(() => {
    const baseFields = [
      {
        name: "movie",
        label: "Select Movie",
        type: "select",
        options: movies,
        required: true,
      },
      {
        name: "location",
        label: "Select Location",
        type: "select",
        options: locations,
        required: true,
        onChange: (e) => {
          const selectedLocation = e.target.value;

          const filtered = allTheaters.filter(
            (t) =>
              t.location_name?.toLowerCase().trim() ===
              selectedLocation?.toLowerCase().trim(),
          );

          setTheaters(
            filtered.map((t) => ({
              label: t.theater_name,
              value: t._id,
              isMultiple: t.isMultiple,
              halls: t.halls,
            })),
          );
        },
      },
      {
        name: "theater",
        label: "Select Theater",
        type: "select",
        options: theaters,
        required: true,
        onChange: (e) => {
          const selectedTheaterId = e.target.value;
          const selected = theaters.find((t) => t.value === selectedTheaterId);

          if (selected?.isMultiple) {
            setIsMultipleHall(true);
            setHalls(
              selected.halls.map((h) => ({
                label: h.hall_name,
                value: h.hall_name,
              })),
            );
          } else {
            setIsMultipleHall(false);
            setHalls([]);
          }
        },
      },
    ];

    if (isMultipleHall) {
      baseFields.push({
        name: "hall_name",
        label: "Select Hall",
        type: "select",
        options: halls,
        required: true,
      });
    }

    baseFields.push(
      {
        name: "startTime",
        label: "Start Time",
        type: "time",
        required: true,
        onChange: handleChange
      },
      {
        name: "endTime",
        label: "End Time",
        type: "time",
        readOnly: true,
        // disabled: true,
      },
      {
        name: "startDate",
        label: "Start Date",
        type: "date",
        required: true,
      },
      {
        name: "endDate",
        label: "End Date",
        type: "date",
        required: true,
      },
    );

    setFields(baseFields);
  }, [movies, locations, theaters, halls, isMultipleHall]);

  // Submit
  const handleSubmit = async (data) => {
    try {
      await axios.post(
        "http://localhost:5000/admin/add-locationwise-movie",
        data,
      );
      toast.success("Show Added Successfully");
    } catch (error) {
      toast.error("Failed to Add Show");
    }
  };

  return (
    <div className="p-8">
      <DynamicForm
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText="Save Show"
      />
    </div>
  );
};

export default AddLocationWiseMovie;
