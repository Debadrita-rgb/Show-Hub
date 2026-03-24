import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";

const EditHalltype = () => {
  const { id } = useParams();
  const [halltype, setHalltype] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/admin/get-single-halltype/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHalltype(data))
      .catch((err) => console.error("Error fetching Halltype:", err));
  }, [id]);

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");
    const payload = {
      ...formData,
      type: "Movie",
    };
    try {
      const res = await fetch(
        `http://localhost:5000/admin/update-halltype/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error("Update failed");
      toast.success("Halltype updated successfully");
      navigate("/admin/view-all-halltype");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed");
    }
  };

  if (!halltype) return <div>Loading...</div>;

  const fields = [
    {
      name: "name",
      label: "halltype Name",
      value: halltype.name,
    },
    {
      name: "seats",
      label: "Seats",
      value: halltype.seats,
      type: "number",
    },
    
  ];

  return (
    <div className="p-6">
      <DynamicForm
        fields={fields}
        onSubmit={handleSubmit}
        submitText="Update Halltype"
      />
    </div>
  );
};

export default EditHalltype;
