import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../../config";

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [image, setImage] = useState([{ imageURL: "", isActive: true }]);

  // Fetch Banner
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-single-banner/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInitialData({
          // page_name: data.page_name || "",
          type: data.type || "",
        });

        // Load existing images
        if (data.page_banner_image?.length > 0) {
          setImage(
            data.page_banner_image.map((img) => ({
              imageURL: img.imageURL,
              isActive: img.isActive ?? false,
            })),
          );
        }
      })
      .catch((err) => console.error("Error fetching Banner:", err));
  }, [id]);

  // Image Handlers
  const handleImageChange = (index, field, value) => {
    const updated = [...image];
    updated[index][field] = value;
    setImage(updated);
  };

  const handleAddImage = () => {
    setImage([...image, { imageURL: "", isActive: true }]);
  };

  const handleRemoveImage = (index) => {
    const updated = [...image];
    updated.splice(index, 1);
    setImage(updated);
  };

  // Submit Update
  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");

    const formattedImages = image.map((item) => ({
      imageURL: item.imageURL,
      isActive: item.isActive === true,
    }));

    const payload = {
      ...formData,
      page_banner_image: formattedImages,
    };

    try {
      const res = await fetch(
        `${BASE_URL}/admin/update-banner/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      toast.success("Banner updated successfully");
      navigate("/admin/view-all-banner");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed");
    }
  };

  if (!initialData) return <div>Loading...</div>;

  const fields = [
    // {
    //   name: "page_name",
    //   label: "Page Name",
    //   type: "text",
    //   required: true,
    // },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: ["home", "show-all-movies", "testimonial", "contact", "feedback"],
    },
  ];

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Image Section */}
      <div className="mb-6 bg-white p-6 border rounded-xl shadow w-full">
        <h2 className="text-sm font-semibold mb-4 text-gray-700">
          Edit Images
        </h2>

        {image.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-4 mb-4 items-center"
          >
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

      {/* Dynamic Form */}
      {initialData ? (
        <DynamicForm
          // key={Id}
          fields={fields.map((f) => ({
            ...f,
            value: initialData[f.name],
          }))}
          initialValues={initialData}
          onSubmit={handleSubmit}
          submitText="Update Banner"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditBanner;
