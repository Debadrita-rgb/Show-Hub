import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
    const navigate = useNavigate();
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/admin/get-single-user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user:", err));
  }, [id]);

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/admin/update-user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error("Update failed");
            toast.success("Stationary item updated successfully");
            navigate("/admin/view-all-user");

    } catch (error) {
      console.error("Update error:", error);
            toast.error("Update failed");
    }
  };

  if (!user) return <div>Loading...</div>;

  const fields = [
    { name: "name", label: "Name", value: user.name },
    { name: "email", label: "Email", value: user.email, type: "email" },
    {
      name: "role",
      label: "Role",
      value: user.role,
      type: "select",
      options: ["MANAGER", "HEADCOOK", "SUPERVISOR"],
    },
  ];

  return (
    <div className="p-6">
      <DynamicForm
        fields={fields}
        onSubmit={handleSubmit}
        submitText="Update User"
      />
    </div>
  );
};

export default EditUser;
