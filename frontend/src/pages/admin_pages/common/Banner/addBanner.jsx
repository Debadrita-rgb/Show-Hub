import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../../config";

const AddBanner = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState([{ imageURL: "", isActive: true }]);
const [formData, setFormData] = useState({
  // page_name: "",
  type: "",
}); 
  const fields = [
    // { name: "page_name", label: "Page Name", type: "text", required: true },
    {
      name: "type",
      label: "Page Type",
      type: "select",
      options: [
        "home",
        "show-all-movies",
        "testimonial",
        "contact",
        "feedback",
      ],
      required: true,
    },
  ];
  
  //Image Segment
  const handleImageChange = (index, field, value) => {
    const updatedItems = [...image];
    updatedItems[index][field] = value;
    setImage(updatedItems);
  };

  const handleAddImage = () => {
    setImage([...image, { imageURL: "", isActive: true }]);
  };

  const handleRemoveImage = (index) => {
    const updatedItems = [...image];
    updatedItems.splice(index, 1);
    setImage(updatedItems);
  };

  const handleFormSubmit = async (formData) => {
    if (image.some((item) => !item.imageURL)) {
      toast.error("Please complete image data");
      return;
    }
    const token = localStorage.getItem("token");
    const payload = {
      ...formData,
      page_banner_image: image,
    };
    // console.log(payload);
    try {
      const res = await fetch(`${BASE_URL}/admin/add-banner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Banner added successfully");
        navigate("/admin/view-all-banner");
      } else {
        toast.error(json.error || "Failed to add Banner");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add Banner");
    }
  };

  return (
    <div className="w-full px-10 py-8 ">
      <div className="mb-6 bg-white p-6 border rounded-xl shadow w-full">
        <h2 className="text-sm font-semibold mb-4 text-gray-700">Add Image</h2>
        {image.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Image URL"
              value={item.imageURL}
              onChange={(e) =>
                handleImageChange(index, "imageURL", e.target.value)
              }
              className="border p-2 w-full border-gray-300 rounded-lg text-black"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.isActive}
                onChange={(e) =>
                  handleImageChange(index, "isActive", e.target.checked)
                }
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">
                {item.isActive ? "Active" : "Not Active"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                +
              </button>
              {image.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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

export default AddBanner;
