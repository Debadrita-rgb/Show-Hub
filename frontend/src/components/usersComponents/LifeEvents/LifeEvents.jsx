import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useLocationcity } from "../../../context/LocationContext.jsx";
import BASE_URL from "../../../../config.js";

const LifeEvents = () => {
  const [CategorizedShow, setCategorizedShow] = useState([]);
  const { city } = useLocationcity();
  const [error, setError] = useState();

  useEffect(() => {
    const type = "Show";

    fetch(`${BASE_URL}/admin/get-typewise-category/${type}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not OK");
        return res.json();
      })
      .then((result) => {
        // result.data is array of banners

        setCategorizedShow(result);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const settings = {
    dots: false,
    infinite: CategorizedShow?.length > 5,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, CategorizedShow?.length || 2),
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };
  return (
    <section className="px-6 md:px-16 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
        The Best Of Life Events
      </h2>

      {CategorizedShow?.length > 0 ? (
        <Slider {...settings}>
          {CategorizedShow.map((cat) => (
            <div key={cat._id} className="px-3">
              <Link to={`/shows/${createSlug(cat.name)}/${cat._id}`}>
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-70 w-full object-cover rounded-xl hover:scale-105 transition duration-300 cursor-pointer"
                  />
                </div>
                <div className="mt-3 text-white">
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-white">{error}</p>
      )}
    </section>
  );
};
export default LifeEvents;
