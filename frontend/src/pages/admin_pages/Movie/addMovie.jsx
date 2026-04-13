import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";

const AddMovie = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [languages, setlanguages] = useState([]);

  const [crew, setCrew] = useState([
    { name: "", dpimageUrl: "", designation: "" },
  ]);
  const [formData, setFormData] = useState({});
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
        setlanguages(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLanguage();
  }, []);

  //Cast Segment
  const handleCastChange = (index, field, value) => {
    const updatedItems = [...casting];
    updatedItems[index][field] = value;
    setCasting(updatedItems);
  };

  const handleAddCasting = () => {
    setCasting([
      ...casting,
      { castname: "", castimageURL: "", inmoviecastname: "" },
    ]);
  };

  const handleRemoveCasting = (index) => {
    const updatedItems = [...casting];
    updatedItems.splice(index, 1);
    setCasting(updatedItems);
  };

  //Crew Segment
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

  const handleFormSubmit = async (formData) => {
    if (
      casting.some(
        (item) => !item.castname || !item.inmoviecastname || !item.castimageURL,
      )
    ) {
      toast.error("Please complete casting data");
      return;
    }

    if (!formData.category || formData.category.length === 0) {
      toast.error("Please select at least one category");
      return;
    }
    if (!formData.language || formData.language.length === 0) {
      toast.error("Please select at least one Language");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const dataToSend = {
        ...formData,
        casting,
        crew,
      };
      // console.log(dataToSend);
      await axios.post(`${BASE_URL}/admin/add-single-movie`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Movie added successfully!");
      navigate("/admin/viewMovie");
    } catch (error) {
      toast.error("Failed to add Movie item");
      console.error(error);
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
    // {
    //   name: "isRecommended",
    //   label: "Recommended",
    //   type: "checkbox",
    //   value: true,
    // },
    {
      name: "trailerlink",
      label: "Trailer Link",
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
      {/* Casting Segment */}
      <div className="mb-6 bg-white p-6 border rounded-xl shadow w-full">
        <h2 className="text-sm font-semibold mb-4 text-gray-700">
          Add Casting
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
              className="border p-2 w-full border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />

            <input
              type="text"
              placeholder="Cast Image URL"
              value={item.castimageURL}
              onChange={(e) =>
                handleCastChange(index, "castimageURL", e.target.value)
              }
              className="border p-2 w-full border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
            <input
              type="text"
              placeholder="In Movie Cast Name"
              value={item.inmoviecastname}
              onChange={(e) =>
                handleCastChange(index, "inmoviecastname", e.target.value)
              }
              className="border p-2 w-full border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCasting}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                +
              </button>
              {casting.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCasting(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Crew Segment  */}

      <div className="mb-6 bg-white p-6 border rounded-xl shadow w-full">
        <h2 className="text-sm font-semibold mb-4 text-gray-700">
          Add Crew Members
        </h2>
        {crew.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Crew Member Name"
              value={item.name}
              onChange={(e) => handleCrewChange(index, "name", e.target.value)}
              className="border p-2 w-full border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />

            <input
              type="text"
              placeholder="Crew Image URL"
              value={item.dpimageUrl}
              onChange={(e) =>
                handleCrewChange(index, "dpimageUrl", e.target.value)
              }
              className="border p-2 w-full border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
            <input
              type="text"
              placeholder="Designation"
              value={item.designation}
              onChange={(e) =>
                handleCrewChange(index, "designation", e.target.value)
              }
              className="border p-2 w-full border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
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

      {/* Dynamic Form */}
      <DynamicForm
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        submitText="Save Movie"
      />
    </div>
  );
};

export default AddMovie;
