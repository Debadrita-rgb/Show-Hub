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

      const getShowImage = () => {
        if (!show.media || show.media.length === 0) return null;

        const activeImage = show.media.find(
          (item) => item.type === "image" && item.isActive,
        );

        if (activeImage) return activeImage.url;

        const youtube = show.media.find(
          (item) => item.type === "youtube" && item.isActive,
        );

        if (youtube) {
          return `https://img.youtube.com/vi/${youtube.url}/hqdefault.jpg`;
        }

        return null;
      };

      const imageUrl = getShowImage() || "/no-image.png";
  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition duration-300 cursor-pointer"
    >
      <img
        src={imageUrl}
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
      </div>
    </div>
  );
};

export default ShowCard;
