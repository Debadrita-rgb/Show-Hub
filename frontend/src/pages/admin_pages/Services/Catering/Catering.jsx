import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/commonComponent/CrudComponent/TableComponent";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Catering = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foodItems, setFoodItems] = useState([]);

  //show all data
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/admin/get-food-item", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFoodItems(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = (foodItems || [])
    .filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((item, index) => ({
      Id: index + 1,
      Name: item.name,
      Price: item.price,
      id: item._id,
      isActive: item.isActive,
      editPath: `/admin/services/catering/editCatering/${item._id}`,
    }));

  //change the active and inactive section
  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/admin/toggle-food-item-status/${id}`,
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
      setFoodItems((prev) =>
        prev.map((item) =>
          item._id === updatedItem.updated._id ? updatedItem.updated : item
        )
      );
      toast.success(
        `Food ${isActive ? "activated" : "deactivated"} successfully`
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
        `http://localhost:5000/admin/delete-food-item/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setFoodItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Food deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <TableComponent
        title="Catering"
        columns={["Id", "Name", "Price"]}
        data={filteredItems}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        addPath="/admin/services/catering/addCatering"
        handleToggleActive={handleToggleActive}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default Catering;
