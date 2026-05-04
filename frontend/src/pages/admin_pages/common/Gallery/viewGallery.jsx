import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/commonComponent/CrudComponent/TableComponent";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../../config";

const viewGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);

  //show all data
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-gallery`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setGalleryItems(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = (galleryItems || []).map((item, index) => ({
    Id: index + 1,
    Image: (
      <img
        src={item.image}
        alt={`Gallery ${index + 1}`}
        className="w-10 h-10 object-cover rounded"
      />
    ),
    id: item._id,
    isActive: item.isActive,
    editPath: false,
  }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/admin/toggle-gallery-status/${id}`,
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

      setGalleryItems((prev) =>
        prev.map((item) =>
          item._id === updatedItem.updated._id ? updatedItem.updated : item
        )
      );
      toast.success(
        `Gallery ${isActive ? "activated" : "deactivated"} successfully`
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
        `${BASE_URL}/admin/delete-gallery-item/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setGalleryItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Gallery deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <TableComponent
        title="Gallery"
        columns={["Id", "Image"]}
        data={filteredItems}
        addPath="/admin/add-gallery"
        handleToggleActive={handleToggleActive}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default viewGallery;
