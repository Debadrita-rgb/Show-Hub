import React, { useState, useEffect } from "react";
import TableComponent from "../../../components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import dayjs from "dayjs";
import BASE_URL from "../../../../config";

const ViewdLocationWiseMovie = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-locationwise-movie`, {
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
     (item.movie?.title || "")
       .toLowerCase()
       .includes((searchTerm || "").toLowerCase()),
   )
   .map((item, index) => {
     const today = dayjs().startOf("day");
     const endDate = dayjs(item.endDate).startOf("day");

     const isActive = today.isBefore(endDate); // today < endDate

     return {
       Id: index + 1,
       MovieName: item.movie?.title,
       Theater: item.theater?.theater_name,
       Hall: item.hall_name || "Single Hall",
      //  StartTime: item.startTime,
      //  EndTime: item.endTime,
       StartDate: dayjs(item.startDate).format("DD.MM.YYYY"),
       EndDate: dayjs(item.endDate).format("DD.MM.YYYY"),
       isActive: isActive,
       id: item._id,
       editPath: `/admin/edit-movie-selection/${item._id}`,
     };
   });
  
  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

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
            title="Movie Shows"
            columns={[
              "Id",
              "MovieName",
              "Theater",
              "Hall",
              // "StartTime",
              // "EndTime",
              "StartDate",
              "EndDate",
            ]}
            data={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            // handleToggleActive={handleToggleActive}
            // handleDelete={handleDelete}
            showAddButton={true}
            showRecommendedeColumn={false}
            addPath="/admin/add-movie-selection"
          />
        </div>
      )}
    </div>
  );
};

export default ViewdLocationWiseMovie;
