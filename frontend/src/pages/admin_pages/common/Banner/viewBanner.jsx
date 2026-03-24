import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";

const ViewBanner = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [banner, setBanner] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/admin/get-banner", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBanner(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);
  
  const formatType = (type) => {
    switch (type) {
      case "home":
        return "Home";
      case "show-all-movies":
        return "Show All Movies";
      default:
        return type;
    }
  };
  
  const filteredItems = (banner || [])
    .filter((item) =>
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((item, index) => {
      return {
        Id: index + 1,
        Type: formatType(item.type),
        id: item._id,
        editPath: `/admin/edit-banner/${item._id}`,
      };
    });

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div>
        <TableComponent
          title="Banner"
          columns={["Id", "Type"]}
          data={filteredItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showActiveColumn={false}
          // handleDelete={handleDelete}
          showAddButton={true}
          addPath="/admin/add-banner"
          showRecommendedeColumn={false}
        />
      </div>
    </div>
  );
};

export default ViewBanner;
