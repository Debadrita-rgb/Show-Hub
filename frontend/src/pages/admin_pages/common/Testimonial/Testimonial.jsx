import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/commonComponent/CrudComponent/TableComponent";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const testimonial = () => {
  const [testimonialItems, setTestimonialItems] = useState([]);

  //show all data
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/admin/get-testimonial", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTestimonialItems(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = (testimonialItems || []).map((item, index) => ({
    Id: index + 1,
    Name: item.name,
    Designation: item.designation,
    id: item._id,
    isActive: item.isActive,
    viewPath: `/admin/view-testimonial-details/${item._id}`,
  }));

const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/admin/toggle-testimonial-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );
      const updatedItem = await res.json();

      // Optionally update the UI without refetching:
      setTestimonialItems((prev) =>
        prev.map((item) =>
          item._id === updatedItem.updated._id ? updatedItem.updated : item
        )
      );
      toast.success(
        `Testimonial ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };
  
  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <TableComponent
        title="Testimonial"
        columns={["Id", "Name", "Designation"]}
        data={filteredItems}
        showAddButton={false}
        showActionColumn={true}
        handleToggleActive={handleToggleActive}
        showActiveColumn={true}
      />
    </div>
  );
};

export default testimonial;
