import React from "react";
import { useNavigate } from "react-router-dom";

const ShowCard = ({ show }) => {
    const navigate = useNavigate();
    
      const createSlug = (title) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .replace(/\s+/g, "-");
      };
      const handleClick = () => {
        const slug = createSlug(show.showName);
        navigate(`/single-show/${show._id}`);
      };

  return (  
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition duration-300 cursor-pointer"
    >
      <img
        src={show.showImage}
        alt={show.showName}
        className="w-full h-80 object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-black">
          {show.showName}
        </h3>

        <p className="text-sm text-gray-500 mb-2">
          {Array.isArray(show.subCategory)
            ? show.subCategory.join(", ")
            : show.subCategory}
        </p>

        {/* <div className="flex items-center justify-between text-sm">
          <span className="text-red-600 font-semibold">
            ⭐ {movie.averageRating ? movie.averageRating.toFixed(1) : 0}
          </span>
          <span className="text-gray-500"> {movie?.totalVotes || 0} Votes</span>
        </div> */}
      </div>
    </div>
  );
};

export default ShowCard;
