import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";

const addGallery = () => {
  const navigate = useNavigate();

  const fields = [    
    { name: "image", label: "Image Link", type: "text" },    
  ];

  const handleFormSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/admin/add-gallery", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Gallery added successfully!");
      navigate("/admin/view-gallery");
    } catch (error) {
      toast.error("Failed to add Catering item");
      console.error(error);
    }
  };

  return (
    <div className="w-full px-10 py-8 ">
      <DynamicForm
        fields={fields}
        onSubmit={handleFormSubmit}
        submitText="Add Gallery"
      />
    </div>
  );
};

export default addGallery;


