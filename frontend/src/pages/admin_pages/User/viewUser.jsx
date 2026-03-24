import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TableComponent from "../../../components/commonComponent/CrudComponent/TableComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState([]);
  const [activeRole, setActiveRole] = useState("MANAGER");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/admin/get-staff-users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStaff(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredUsers = (staff || [])
    .filter((user) => user.role === activeRole)
    .filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((user, index) => ({
      Id: index + 1,
      Name: user.name,
      Email: user.email,
      id: user._id,
      isActive: user.isActive,
      editPath: `/admin/edit-user/${user._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/admin/toggle-user-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );
      const updated = await res.json();
      setStaff((prev) =>
        prev.map((u) => (u._id === updated.updated._id ? updated.updated : u))
      );
      toast.success(
        `${activeRole} ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      toast.error("Status toggle failed");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`http://localhost:5000/admin/delete-user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff((prev) => prev.filter((u) => u._id !== id));
      toast.success(`${activeRole} deleted successfully`);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {["MANAGER", "HEADCOOK", "SUPERVISOR"].map((role) => (
            <button
              key={role}
              className={`px-4 py-2 rounded-full font-semibold ${
                activeRole === role
                  ? "bg-white text-blue-600 shadow-md"
                  : "bg-gray-600 text-white"
              }`}
              onClick={() => setActiveRole(role)}
            >
              {role === "HEADCOOK"
                ? "Head Cook"
                : role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Link
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
          to="/admin/add-user"
        >
          Add User
        </Link>
      </div>
      <TableComponent
        title={`${
          activeRole === "HEADCOOK"
            ? "Head Cook"
            : activeRole.charAt(0) + activeRole.slice(1).toLowerCase()
        }s`}
        columns={["Id", "Name", "Email"]}
        data={filteredUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleToggleActive={handleToggleActive}
        handleDelete={handleDelete}
        showAddButton={false}
      />
    </div>
  );
};

export default ViewUser;
