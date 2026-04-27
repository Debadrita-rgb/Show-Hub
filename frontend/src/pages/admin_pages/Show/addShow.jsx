import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../../../../config";
import { getYouTubeVideoId } from "../../../utils/youtube";


const AddShow = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [media, setMedia] = useState([{ type: "image", url: "" }]);
  const [locations, setLocations] = useState([
    {
      locationName: "",
      theaterName: "",
      startTime: "",
      date: "",
      duration: "",
      price: "",
    },
  ]);

  const addMedia = () => {
    setMedia([...media, { type: "image", url: "" }]);
  };

  

 const handleMediaChange = (index, field, value) => {
   const updated = [...media];
   updated[index][field] = value;

   if (field === "url") {
     const type = updated[index].type;

     if (type === "youtube") {
       const id = getYouTubeVideoId(value);
       if (!id && value !== "") {
         toast.warn("Enter valid YouTube link");
       }
     }

     if (type === "image") {
       const isYT = getYouTubeVideoId(value);
       if (isYT) {
         toast.warn("This looks like YouTube link, change type");
       }
     }
   }

   setMedia(updated);
 };

  const removeMedia = (index) => {
    const updated = [...media];
    updated.splice(index, 1);
    setMedia(updated);
  };

  const [artists, setArtists] = useState([
    { artist_name: "", designation: "", artist_image: "" },
  ]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [formData, setFormData] = useState({
    showName: "",
    // showImage: "",
    category: "",
    subCategory: "",
    isMultipleLocation: false,
    languages: [],
    ageLimit: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  /*  FETCH CATEGORY  */

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${BASE_URL}/admin/get-typewise-category/Show`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setCategories(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCategory();
  }, []);

  /* FETCH LANGUAGE  */

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${BASE_URL}/admin/get-language`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setLanguages(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchLanguage();
  }, []);

  /* HANDLE INPUT  */

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData({
    ...formData,
    [name]: type === "checkbox" ? checked : value,
  });

  //  CATEGORY CHANGE LOGIC
  if (name === "category") {
    const selectedCategory = categories.find((cat) => cat._id === value);

    if (selectedCategory?.subCategories) {
      setSubCategories(selectedCategory.subCategories);
    } else {
      setSubCategories([]);
    }

    setSelectedSubCategories([]);
  }
};

  /* LOCATION FUNCTIONS */

  const addLocation = () => {
    setLocations([
      ...locations,
      {
        locationName: "",
        theaterName: "",
        startTime: "",
        date: "",
        duration: "",
        price: "",
      },
    ]);
  };

  const handleLocationChange = (index, e) => {
    const { name, value } = e.target;

    const updatedLocations = [...locations];
    updatedLocations[index][name] = value;

    setLocations(updatedLocations);
  };

  const removeLocation = (index) => {
    const updated = [...locations];
    updated.splice(index, 1);
    setLocations(updated);
  };

  /* ARTIST FUNCTIONS  */

  const addArtist = () => {
    setArtists([
      ...artists,
      { artist_name: "", designation: "", artist_image: "" },
    ]);
  };

  const handleArtistChange = (index, field, value) => {
    const updatedItems = [...artists];
    updatedItems[index][field] = value;
    setArtists(updatedItems);
  };

  const handleRemoveArtist = (index) => {
    const updatedItems = [...artists];
    updatedItems.splice(index, 1);
    setArtists(updatedItems);
  };

  /* LANGUAGE SELECT */

  // const handleLanguageChange = (e) => {
  //   const selected = Array.from(e.target.selectedOptions).map(
  //     (option) => option.value,
  //   );

  //   setFormData({ ...formData, languages: selected });
  // };
  const addLanguage = (e) => {
    const value = e.target.value;

    if (!selectedLanguages.includes(value)) {
      const updated = [...selectedLanguages, value];

      setSelectedLanguages(updated);
      setFormData({ ...formData, languages: updated });
    }
  };
  const removeLanguage = (lang) => {
    const updated = selectedLanguages.filter((l) => l !== lang);

    setSelectedLanguages(updated);
    setFormData({ ...formData, languages: updated });
  };

  // Add multiple Subcagory
  const addSubCategory = (e) => {
    const value = e.target.value;

    if (!selectedSubCategories.includes(value)) {
      setSelectedSubCategories([...selectedSubCategories, value]);
    }
  };

  //Remove Sub category
  const removeSubCategory = (sub) => {
    setSelectedSubCategories(selectedSubCategories.filter((s) => s !== sub));
  };

  /* SUBMIT */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
// const videoId = getYouTubeVideoId(formData.showVideoEmbedURL);

const formattedMedia = media.map((item, index) => {
  if (!item.url.trim()) {
    toast.error(`Media ${index + 1} URL is required`);
    throw new Error("Empty media");
  }

  if (item.type === "youtube") {
    const videoId = getYouTubeVideoId(item.url);

    if (!videoId) {
      toast.error(`Media ${index + 1}: Invalid YouTube URL`);
      throw new Error("Invalid YouTube");
    }

    return { type: "youtube", url: videoId };
  }

  return item;
});


const filteredArtists = artists.filter(
  (a) =>
    a.artist_name.trim() !== "" ||
    a.designation.trim() !== "" ||
    a.artist_image.trim() !== "",
);

      const payload = {
        ...formData,
        locations,
        subCategory: selectedSubCategories,
        artists: filteredArtists.length > 0 ? filteredArtists : [],
        media: formattedMedia,
      }; 

      if (formData.isMultipleLocation) {
        payload.locations = locations;
        payload.startDate = "";
        payload.endDate = "";
      } else {
        payload.locations = locations.map((loc) => ({
          ...loc,
          date: null,
        }));
      }

      await axios.post(`${BASE_URL}/admin/add-show`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Show Added Successfully");
      navigate("/admin/view-all-shows");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 md:px-10 py-8">
      <ToastContainer position="top-right" autoClose={2000} />

      <form
        onSubmit={handleSubmit}
        className="md:p-10 text-black w-full h-full bg-white p-10 border border-gray-200 rounded-xl shadow"
      >
        {/* SHOW INFO */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Show Name
            </label>
            <input
              name="showName"
              value={formData.showName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
          </div>
          <div>
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option>Select Category</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* SUBCATEGORY */}

          <div className="mt-6">
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Sub Categories
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSubCategories.map((sub) => (
                <div
                  key={sub}
                  className="bg-purple-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {sub}

                  <button type="button" onClick={() => removeSubCategory(sub)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <select
              onChange={addSubCategory}
              className="w-full border p-3 rounded-lg"
              defaultValue=""
            >
              <option value="">Select Sub Category</option>

              {subCategories.map((sub, i) => (
                <option key={i} value={sub.title}>
                  {sub.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <label className="font-semibold">Images / YouTube Links</label>

          {media.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              {/* TYPE SELECT */}
              <select
                value={item.type}
                onChange={(e) =>
                  handleMediaChange(index, "type", e.target.value)
                }
                className="border p-2 rounded"
              >
                <option value="image">Image</option>
                <option value="youtube">YouTube</option>
              </select>

              {/* URL INPUT */}
              <input
                type="text"
                placeholder="Enter URL"
                value={item.url}
                onChange={(e) =>
                  handleMediaChange(index, "url", e.target.value)
                }
                className="flex-1 border p-2 rounded"
              />

              {/* REMOVE */}
              {media.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addMedia}
            className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
          >
            + Add Media
          </button>
        </div>
        {/* MULTIPLE LOCATION */}

        <div className="mt-8">
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              name="isMultipleLocation"
              checked={formData.isMultipleLocation}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Multiple Location
          </label>
        </div>

        {/* LOCATION SECTION */}

        <div className="mt-6 bg-gray-50 border rounded-xl p-4 sm:p-6">
          {" "}
          <h3 className="text-lg font-semibold mb-4">Show Locations</h3>
          {locations.map((loc, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4 items-center"
            >
              <div>
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  Location Name
                </label>
                <input
                  name="locationName"
                  placeholder="Location"
                  value={loc.locationName}
                  onChange={(e) => handleLocationChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black min-w-0"
                />
              </div>
              <div>
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  Theater Name
                </label>
                <input
                  name="theaterName"
                  placeholder="Theater"
                  value={loc.theaterName}
                  onChange={(e) => handleLocationChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              </div>
              <div>
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  Show Start Time
                </label>
                <input
                  name="startTime"
                  type="time"
                  value={loc.startTime}
                  onChange={(e) => handleLocationChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              </div>

              {formData.isMultipleLocation && (
                <div>
                  <label className="mb-1 text-sm font-semibold text-gray-700">
                    Show Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={loc.date}
                    onChange={(e) => handleLocationChange(index, e)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  Show Duration in Minutes
                </label>
                <input
                  name="duration"
                  placeholder="Duration"
                  value={loc.duration}
                  onChange={(e) => handleLocationChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              </div>
              <div>
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  Show Price
                </label>
                <input
                  name="price"
                  placeholder="Price"
                  value={loc.price}
                  onChange={(e) => handleLocationChange(index, e)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              </div>

              {/* REMOVE BUTTON */}

              {formData.isMultipleLocation && locations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="bg-red-400 text-white px-1 py-1 rounded hover:bg-red-600"
                >
                  X
                </button>
              )}
            </div>
          ))}
          {!formData.isMultipleLocation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              </div>

              <div>
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                />
              </div>
            </div>
          )}
          {/* ADD BUTTON */}
          {formData.isMultipleLocation && (
            <button
              type="button"
              onClick={addLocation}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Location
            </button>
          )}
        </div>
        {/* LANGUAGES */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="mt-6">
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Show Language
            </label>

            {/* Selected Languages */}
            <div className="flex flex-wrap gap-2 mb-3 text-black">
              {selectedLanguages.map((lang) => (
                <div
                  key={lang}
                  className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {lang}

                  <button type="button" onClick={() => removeLanguage(lang)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Dropdown */}

            <select
              onChange={addLanguage}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option>Select Show Language</option>

              {languages.map((lang) => (
                <option key={lang._id} value={lang.title}>
                  {lang.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6">
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Age Limit
            </label>

            <input
              name="ageLimit"
              value={formData.ageLimit}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
          </div>
        </div>

        {/* ARTISTS */}

        <div className="mt-8 rounded-xl">
          <h3 className="font-semibold mb-4">Add Artist Members</h3>

          {artists.map((artist, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3"
            >
              <input
                name="artist_name"
                placeholder="Artist Name"
                value={artist.artist_name}
                onChange={(e) =>
                  handleArtistChange(index, "artist_name", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              />
              <input
                name="artist_image"
                placeholder="Artist Image"
                value={artist.artist_image}
                onChange={(e) =>
                  handleArtistChange(index, "artist_image", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              />
              <input
                name="designation"
                placeholder="Designation"
                value={artist.designation}
                onChange={(e) =>
                  handleArtistChange(index, "designation", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              />
              <button
                type="button"
                onClick={addArtist}
                className="bg-green-500 text-white rounded-lg px-4"
              >
                +
              </button>
              {artists.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArtist(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
              )}
            </div>
          ))}
        </div>

        {/* AGE + DESCRIPTION */}

        <div className="mt-6">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Description
          </label>
          
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            rows="4"
          />
        </div>

        {/* DATES */}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-6"
        >
          Add Show
        </button>
      </form>
    </div>
  );
};

export default AddShow;
