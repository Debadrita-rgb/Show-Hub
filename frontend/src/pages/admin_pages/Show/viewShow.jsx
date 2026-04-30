import React, { useState, useEffect } from "react";
import TableComponent from "../../../components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import BASE_URL from "../../../../config";
import shouldBeActive from "../../../helper/autoDeactivehelper";

const viewShow = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [show, setShow] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-show-and-category`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedShows = data.map((item) => {
          const isStillActive = shouldBeActive(item);

          return {
            ...item,
            isActive: isStillActive,
          };
        });
        setShow(updatedShows);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = (show || [])
    .filter((item) =>
      item.showName?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((item, index) => {
      return {
        Id: index + 1,
        Showname: item.showName,
        Category: item.category?.name || "N/A", 
        id: item._id,
        isActive: item.isActive,
        isRecommended: item.isRecommended,

        editPath: `/admin/edit-show/${item._id}`,
      };
    });

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/admin/toggle-show-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        },
      );

      if (!res.ok) throw new Error("Toggle failed");

      setShow((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive } : item)),
      );

      toast.success(
        `Show ${isActive ? "activated" : "deactivated"} successfully`,
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
        `${BASE_URL}/admin/delete-show/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Delete failed");

      setShow((prev) => prev.filter((item) => item._id !== id));
      toast.success("Show deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  const handleToggleRecommended = async (id, isRecommended) => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `${BASE_URL}/admin/toggle-show-recommended/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isRecommended }),
          },
        );
  
        if (!res.ok) throw new Error("Toggle failed");
  
        setShow((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isRecommended } : item,
          ),
        );
  
        toast.success(
          `Show is ${isRecommended ? "Recommended" : "no Recommended"}`,
        );
      } catch (err) {
        console.error("Toggle failed:", err);
      }
    };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div>
        <TableComponent
          title="Show"
          columns={["Id", "Showname", "Category"]}
          data={filteredItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleToggleActive={handleToggleActive}
          handleDelete={handleDelete}
          showAddButton={true}
          addPath="/admin/add-show"
          showRecommendedeColumn={false}
          // handleToggleRecommended={handleToggleRecommended}
        />
      </div>
    </div>
  );

};
export default viewShow;
