import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../config";
import { getYouTubeVideoId } from "../../../utils/youtube";

const EditMovie = () => {
  const navigate = useNavigate();
  const { id: movieId } = useParams();
  const token = localStorage.getItem("token");

  const [initialData, setInitialData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [crew, setCrew] = useState([
    { name: "", dpimageUrl: "", designation: "" },
  ]);

  const [casting, setCasting] = useState([
    { castname: "", castimageURL: "", inmoviecastname: "" },
  ]);

  //Fetch category types 
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        const type = "Movie";

        const res = await axios.get(
          `${BASE_URL}/admin/get-typewise-category/${type}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategory();
  }, []);

  //Fetch Language types
  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${BASE_URL}/admin/get-language`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setLanguages(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLanguage();
  }, []);

  // Fetch existing service data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/admin/get-single-movie/${movieId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = res.data;
        setInitialData({
          title: data.title || "",
          movieimage: data.movieimage || "",
          language: data.language || "",
          totalTiming: data.totalTiming || "",
          backgroundUrl: data.backgroundUrl || "",
          releasedDate: data.releasedDate ? data.releasedDate.slice(0, 10) : "",
          movieDescription: data.movieDescription || "",
          category: data.category || [],
          format: data.format || [],
          trailerlink: data.trailerlink
            ? `https://www.youtube.com/watch?v=${data.trailerlink}`
            : "", 
        });
        setCasting(
          data.casting || [
            { castname: "", castimageURL: "", inmoviecastname: "" },
          ],
        );
        setCrew(data.crew || [{ name: "", dpimageUrl: "", designation: "" }]);
      } catch (error) {
        console.error("Failed to fetch Movie:", error);
        toast.error("Failed to load Movie service.");
      }
    };

    if (movieId) fetchData();
  }, [movieId, token]);

  // Casting Management
  const handleCastChange = (index, field, value) => {
    const updatedItems = [...casting];
    updatedItems[index][field] = value;
    setCasting(updatedItems);
  };
  const handleAddCast = () => {
    setCasting([
      ...casting,
      { castname: "", castimageUrl: "", inmoviecastname: "" },
    ]);
  };

  const handleRemoveCast = (index) => {
    const updatedItems = [...casting];
    updatedItems.splice(index, 1);
    setCasting(updatedItems);
  };

  //Crew Management
  const handleCrewChange = (index, field, value) => {
    const updatedItems = [...crew];
    updatedItems[index][field] = value;
    setCrew(updatedItems);
  };
  const handleAddCrew = () => {
    setCrew([...crew, { name: "", dpimageUrl: "", designation: "" }]);
  };

  const handleRemoveCrew = (index) => {
    const updatedItems = [...crew];
    updatedItems.splice(index, 1);
    setCrew(updatedItems);
  };

  // Submit updated data
  const handleSubmit = async (formData) => {
    try {
      const updatedData = {
        ...formData,
        casting: casting,
        crew: crew,
      };

      const res = await axios.put(
        `${BASE_URL}/admin/update-single-movie/${movieId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 200) {
        toast.success("Movie updated successfully!");
        navigate("/admin/viewMovie");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update failed");
    }
  };

  const fields = [
    {
      name: "title",
      label: "Movie title",
      type: "text",
      required: true,
    },
    { name: "movieimage", label: "Movie Image", type: "text" },
    {
      name: "releasedDate",
      label: "Released Date",
      type: "date",
      required: true,
    },
    {
      name: "language",
      label: "Movie Language",
      type: "select",
      required: true,
      multiple: true,
      options: languages.map((lan) => lan.title),
    },
    {
      name: "format",
      label: "Select Format",
      type: "select",
      required: true,
      multiple: true,
      options: [
        "2D",
        "3D",
        "IMAX 3D",
        "4DX",
        "DOLBY CINEMA 2D",
        "ICE",
        "2D SCREEN X",
      ],
    },
    {
      name: "totalTiming",
      label: "Movie Timing in Minutes",
      type: "number",
      required: true,
    },
    {
      name: "category",
      label: "Select Category",
      type: "select",
      required: true,
      multiple: true,
      options: categories.map((cat) => cat.name),
    },
    { name: "backgroundUrl", label: "Background Url", type: "text" },
    {
      name: "trailerlink",
      label: "Trailer Link (YouTube only)",
      type: "text",
      validation: {
        pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//,
        message: "Enter valid YouTube URL",
      },
    },
    { name: "movieDescription", label: "Movie Description", type: "tiptap" },
  ];

  return (
    <div className="p-8">
      <ToastContainer position="top-right" autoClose={2000} />

      <h2 className="text-xl font-bold mb-4">Edit Movie</h2>
      <div className="mb-6 bg-white p-6 border rounded-xl shadow w-full">
        <h2 className="text-sm font-semibold mb-4 text-gray-700">
          Casting Members
        </h2>
        {casting.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Cast Name"
              value={item.castname}
              onChange={(e) =>
                handleCastChange(index, "castname", e.target.value)
              }
              className="border p-2 w-full rounded-lg focus:outline-none focus:ring text-black"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={item.castimageURL}
              onChange={(e) =>
                handleCastChange(index, "castimageURL", e.target.value)
              }
              className="border p-2 w-full rounded-lg focus:outline-none focus:ring text-black"
            />
            <input
              type="string"
              placeholder="In Movie Cast Name"
              value={item.inmoviecastname}
              onChange={(e) =>
                handleCastChange(index, "inmoviecastname", e.target.value)
              }
              className="border p-2 w-full rounded-lg focus:outline-none focus:ring text-black"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCast}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                +
              </button>
              {casting.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCast(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
              )}
            </div>
          </div>
        ))}
      </div>


      <div className="mb-6 bg-white p-6 border rounded-xl shadow w-full">
        <h2 className="text-sm font-semibold mb-4 text-gray-700">
          Crew Members Management
        </h2>
        {crew.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Crew Name"
              value={item.name}
              onChange={(e) => handleCrewChange(index, "name", e.target.value)}
              className="border p-2 w-full rounded-lg focus:outline-none focus:ring text-black"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={item.dpimageUrl}
              onChange={(e) =>
                handleCrewChange(index, "dpimageUrl", e.target.value)
              }
              className="border p-2 w-full rounded-lg focus:outline-none focus:ring text-black"
            />
            <input
              type="string"
              placeholder="Designation"
              value={item.designation}
              onChange={(e) =>
                handleCrewChange(index, "designation", e.target.value)
              }
              className="border p-2 w-full rounded-lg focus:outline-none focus:ring text-black"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCrew}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                +
              </button>
              {crew.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCrew(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {initialData ? (
        <DynamicForm
          key={movieId}
          fields={fields.map((f) => ({
            ...f,
            value: initialData[f.name],
          }))}
          initialValues={initialData}
          onSubmit={handleSubmit}
          submitText="Update Movie"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};;

export default EditMovie;
