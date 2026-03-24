import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "designation", label: "Designation", type: "text" },
  { name: "profileimage", label: "Profile Image", type: "img" },
  { name: "message", label: "Message", type: "textarea", rows: 5 },
];

const Viewtestimonialdetails = () => {
  const { id: conatctId } = useParams();
  const [initialData, setInitialData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!conatctId) return;

    fetch(`http://localhost:5000/admin/get-single-testimonial/${conatctId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInitialData({
          name: data.name || "",
          designation: data.designation || "",
          profileimage: data.profileimage || "",
          message: data.message || "",
        });
      })
      .catch((err) => {
        console.error("Error fetching testimonial:", err);
        toast.error("Failed to load testimonial details.");
      });
  }, [conatctId]);

  return (
    <div className="p-6">
      {initialData ? (
        <DynamicForm
          fields={fields.map((f) => ({
            ...f,
            value: initialData[f.name],
            readOnly: true,
          }))}
          submitText=""
          onSubmit={() => {}}
          showSubmit={false}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Viewtestimonialdetails;
