import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/commonComponent/CrudComponent/TableComponent";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const feedback = () => {
  const [feedbackItems, setFeedbackItems] = useState([]);

  //show all data
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/admin/get-fullfeedback-details", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFeedbackItems(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = (feedbackItems || []).map((item, index) => ({
    Id: index + 1,
    Name: item.name,
    Email: item.email,
    id: item._id,
    viewPath: `/admin/view-feedback-details/${item._id}`,
  }));

  
  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <TableComponent
        title="Feedback"
        columns={["Id", "Name", "Email"]}
        data={filteredItems}
        showAddButton={false}
        showActionColumn={true}
        showActiveColumn={false}
      />
    </div>
  );
};

export default feedback;
