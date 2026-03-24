import React, { useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";

const AddStationary = () => {
  const navigate = useNavigate();

  const fields = [
    { name: "name", label: "Stationary Name" },
    { name: "price", label: "Price", type: "number" },
    { name: "image", label: "Image", type: "text" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "description", label: "Description", type: "tiptap" },
  ];

  const handleFormSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/admin/add-stationary-item",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Stationary added successfully!");
      navigate("/admin/services/stationary");
    } catch (error) {
      toast.error("Failed to add Stationary item");
      console.error(error);
    }
  };
  useEffect(() => {
    toast.success("Toast works!");
  }, []);

  return (
    <div className="w-full px-10 py-8 ">
      <DynamicForm
        fields={fields}
        onSubmit={handleFormSubmit}
        submitText="Add Stationary"
      />
    </div>
  );
};

export default AddStationary;
