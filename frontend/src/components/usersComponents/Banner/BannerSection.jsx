import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useLocation } from "react-router-dom";
import BASE_URL from "../../../../config";

const BannerSection = () => {
  const [activeIndex, setActiveIndex] = useState([]);
  const [images, setImages] = useState();

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    const pageType1 = path === "/" ? "home" : path.replace("/", "");

    fetch(`${BASE_URL}/user/get-banner/${pageType1}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not OK");
        return res.json();
      })
      .then((result) => {
        const allImages = result.data.flatMap((banner) =>
          banner.page_banner_image.map((img) => img.imageURL),
        );

        setImages(allImages);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
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

  return (
    <section className="px-6 md:px-16 py-15">
      {images?.length > 0 ? (
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index} className="px-2">
              <div className="rounded-2xl overflow-hidden shadow-lg relative group">
                <img
                  src={img}
                  alt={`banner ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-white">No images found.</p>
      )}
    </section>
  );
};

export default BannerSection;
