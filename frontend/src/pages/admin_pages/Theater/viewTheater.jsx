import React, { useState, useEffect } from "react";
import TableComponent from "../../../components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";

const ViewTheater = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [theater, setTheater] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/admin/get-theater", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTheater(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

 const filteredItems = (theater || [])
   .filter((item) => {
     const search = searchTerm.toLowerCase();

     const fieldsToSearch = [item.theater_name, item.location_name];

     return fieldsToSearch.some((field) =>
       field?.toLowerCase().includes(search),
     );
   })
   .map((item, index) => ({
     Id: index + 1,
     Theatername: item.theater_name,
     Location: item.location_name,
     MultipleHalls: item.isMultiple ? "Yes" : "No",
     id: item._id,
     isActive: item.isActive,
     editPath: `/admin/edit-theater/${item._id}`,
   }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/admin/toggle-theater-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (!res.ok) throw new Error("Toggle failed");

      setTheater((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive } : item))
      );

      toast.success(
        `Theater ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  // delete
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!id) {
      console.error("Invalid ID passed to delete.");
      toast.error("Invalid item selected for deletion.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/admin/delete-theater/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setTheater((prev) => prev.filter((item) => item._id !== id));
      toast.success("Theater deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div>
        <TableComponent
          title="Theater"
          columns={["Id", "Theatername", "Location", "MultipleHalls"]}
          data={filteredItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleToggleActive={handleToggleActive}
          handleDelete={handleDelete}
          showAddButton={true}
          addPath="/admin/add-theater"
          showRecommendedeColumn={false}
        />
      </div>
    </div>
  );
};

export default ViewTheater;
