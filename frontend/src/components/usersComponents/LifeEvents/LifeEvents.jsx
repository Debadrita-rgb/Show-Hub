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

  // const movies = [
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-NDArIEV2ZW50cw%3D%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/comedy-shows-collection-202211140440.png",
  //     title: "Comedy Show",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-MTArIEV2ZW50cw%3D%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/amusement-parks-banner-desktop-collection-202503251132.png",
  //     title: "Amusment Park",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-OTUrIEV2ZW50cw%3D%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/arts-crafts-collection-202211140440.png",
  //     title: "Comedy Show",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-MjUrIEV2ZW50cw%3D%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/music-shows-collection-202211140440.png",
  //     title: "Comedy Show",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-MTUrIEV2ZW50cw%3D%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/kids-banner-desktop-collection-202503251132.png",
  //     title: "Comedy Show",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-MTAgRXZlbnRz,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/theatre-shows-collection-202211140440.png",
  //     title: "Comedy Show",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-MyBFdmVudHM%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/upskill-collection-202211140440.png",
  //     title: "Comedy Show",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-NSBFdmVudHM%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/interactive-games-collection-202211140440.png",
  //     title: "Comedy Show",
  //   },
  //   {
  //     movieimage:
  //       "https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-800,h-800:l-text,ie-MTEwKyBFdmVudHM%3D,co-FFFFFF,ff-Roboto,fs-64,lx-48,ly-320,tg-b,pa-8_0_0_0,l-end:w-300/workshop-and-more-web-collection-202211140440.png",
  //     title: "Comedy Show",
  //   },
  // ];
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
