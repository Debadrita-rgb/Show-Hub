import React, { useState, useEffect } from "react";
import TableComponent from "../../../components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import BASE_URL from "../../../../config";

const ViewMovie = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-movie`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = movies
    .filter((item) =>
      (item.title || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()),
    )
    .map((item, index) => ({
      Id: index + 1,
      MovieName: item.title,
      id: item._id,
      isActive: item.isActive,
      isRecommended: item.isRecommended,
      editPath: `/admin/editMovie/${item._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/admin/toggle-movie-status/${id}`,
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

      setMovies((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive } : item)),
      );

      toast.success(
        `Movie ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleToggleRecommended = async (id, isRecommended) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/admin/toggle-movie-recommended/${id}`,
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

      setMovies((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRecommended } : item,
        ),
      );

      toast.success(
        `Movie is ${isRecommended ? "Recommended" : "no Recommended"}`,
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
        `${BASE_URL}/admin/delete-movie/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setMovies((prev) => prev.filter((item) => item._id !== id));
      toast.success("Movie deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Show Table When Category Clicked */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span className="ml-4 text-blue-600 font-medium">
            Loading services...
          </span>
        </div>
      ) : (
        <div>
          <TableComponent
            // title={selectedCategory}
            title="Movie"
            columns={["Id", "MovieName"]}
            data={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleToggleActive={handleToggleActive}
            handleToggleRecommended={handleToggleRecommended}
            handleDelete={handleDelete}
            // showEdit={true}
            // editPath="editLink"
            showAddButton={true}
            addPath="/admin/addMovie"
          />
        </div>
      )}
    </div>
  );
};

export default ViewMovie;
