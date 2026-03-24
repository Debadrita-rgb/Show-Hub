import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

const AddCategory = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    type: "",
  });

  const [subCategories, setSubCategories] = useState([{ title: "" }]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset subcategories if Movie selected
    if (name === "type" && value === "Movie") {
      setSubCategories([{ title: "" }]);
    }
  };

  const addSubCategory = () => {
    setSubCategories([...subCategories, { title: "" }]);
  };

  const removeSubCategory = (index) => {
    const updated = [...subCategories];
    updated.splice(index, 1);
    setSubCategories(updated);
  };

  const handleSubChange = (index, value) => {
    const updated = [...subCategories];
    updated[index].title = value;
    setSubCategories(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
  ...(formData.type === "Show" && { subCategories }),
    };

    try {
      const res = await fetch("http://localhost:5000/admin/add-type-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Category added successfully");
        navigate("/admin/view-all-category");
      } else {
        toast.error(json.error || "Failed to add category");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="w-full px-10 py-8 ">
      <ToastContainer position="top-right" autoClose={2000} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 border border-gray-200 rounded-xl shadow text-black "
      >
        <h2 className="text-2xl font-semibold mb-6">Add Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Name */}
          <div>
            <label className="block mb-1">Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="block mb-1">Image Link</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              required
            >
              <option value="">Select Type</option>
              <option value="Movie">Movie</option>
              <option value="Show">Show</option>
            </select>
          </div>
        </div>
        {/* Subcategories */}
        {formData.type === "Show" && (
          <div className="mb-6 mt-6">
            <h3 className="text-lg font-semibold mb-3">Sub Categories</h3>

            {subCategories.map((item, index) => (
              <div key={index} className="flex gap-3 mb-3 items-center">
                <input
                  type="text"
                  placeholder="Subcategory Name"
                  value={item.title}
                  onChange={(e) => handleSubChange(index, e.target.value)}
                  className="border p-2 rounded w-full"
                />

                <button
                  type="button"
                  onClick={addSubCategory}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  +
                </button>

                {subCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubCategory(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-6"
        >
          Add Category
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
