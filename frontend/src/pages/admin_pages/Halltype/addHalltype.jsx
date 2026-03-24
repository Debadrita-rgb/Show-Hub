import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";

const AddHalltype = () => {
  const navigate = useNavigate();

  const halltypeFields = [
    { name: "name", label: "Halltype Name", type: "text" },
    { name: "seats", label: "Total Seats", type: "Number" },
  ];

  const handleAddHalltype = async (data) => {
    const token = localStorage.getItem("token");
    const payload = {
      ...data,
      type: "Movie",
    };
    try {
      const res = await fetch("http://localhost:5000/admin/add-halltype", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Halltype added successfully");
        navigate("/admin/view-all-halltype");
      } else {
        toast.error(json.error || "Failed to add halltype");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add halltype");
    }
  };

  return (
    <div className="w-full px-10 py-8 ">
      <DynamicForm
        fields={halltypeFields}
        onSubmit={handleAddHalltype}
        submitText="Add Halltype"
      />
    </div>
  );
};

export default AddHalltype;
