import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";

const EditStationary = () => {
  const navigate = useNavigate();
  const { id: stationaryId } = useParams();

  const [initialData, setInitialData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!stationaryId) return;

    fetch(`http://localhost:5000/admin/get-single-stationary-item/${stationaryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInitialData({
          name: data.name || "",
          price: data.price || "",
          image: data.image || "",
          description: data.description || "",
          quantity: data.quantity || "",
        });
      })
      .catch((err) => {
        console.error("Error fetching item:", err);
        toast.error("Failed to load stationary item.");
      });
  }, [stationaryId]);

  const handleSubmit = async (formData) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/update-stationary-item/${stationaryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Update failed");
      toast.success("Stationary item updated successfully");
      navigate("/admin/services/stationary");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update failed");
    }
  };

  const fields = [
    { name: "name", label: "Stationary Name", placeholder: "Enter name" },
    {
      name: "price",
      label: "Price",
      placeholder: "Enter price",
      type: "number",
    },
    { name: "image", label: "Image Link", placeholder: "Enter image URL" },
    {
      name: "quantity",
      label: "Quantity",
      placeholder: "Enter Quantity",
      type: "number",
    },
    {
      name: "description",
      label: "Description",
      type: "tiptap",
      placeholder: "Write a description...",
      rows: 5,
    },
  ];

  // useEffect(() => {
  //   toast.success("Data Retrieved Successfully");
  // }, []);
  
  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      {initialData ? (
        <DynamicForm
          fields={fields.map((f) => ({ ...f, value: initialData[f.name] }))}
          onSubmit={handleSubmit}
          submitText="Update Stationary"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditStationary;
