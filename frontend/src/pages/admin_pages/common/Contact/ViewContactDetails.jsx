import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DynamicForm from "../../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../../config";

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "message", label: "Message", type: "textarea", rows: 5 },
];

const Viewcontactdetails = () => {
  const { id: conatctId } = useParams();
  const [initialData, setInitialData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!conatctId) return;

    fetch(`${BASE_URL}/admin/get-single-contact/${conatctId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInitialData({
          name: data.name || "",
          email: data.email || "",
          message: data.message || "",
        });
      })
      .catch((err) => {
        console.error("Error fetching contact:", err);
        toast.error("Failed to load contact details.");
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

export default Viewcontactdetails;
