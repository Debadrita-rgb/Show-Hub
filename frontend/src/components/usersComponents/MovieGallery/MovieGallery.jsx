import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useLocationcity } from "../../../context/LocationContext.jsx";
import BASE_URL from "../../../../config.js";


const MovieGallery = () => {
  const [movies, setMovies] = useState([]);
  const { city } = useLocationcity();
  const [error, setError] = useState();

   useEffect(() => {
     const fetchMovies = async () => {
       try {
         const queryCity = city && city !== "Detecting..." ? city : "";
         const url = queryCity
           ? `${BASE_URL}/user/get-recommended-movies-by-location?city=${queryCity}`
           : `${BASE_URL}/user/get-recommended-movies-by-location`;

         const res = await fetch(url); 

         if (!res.ok) {
           const errData = await res.json(); 
           setMovies([]); 
           setError(errData.message || "No movies found");
           return; 
         }

         const data = await res.json();
         setMovies(data.data);
         setError(""); 
       } catch (err) {
         setMovies([]);
         setError("Something went wrong"); 
       }
     };

     fetchMovies();
   }, [city]);

  const settings = {
    dots: false,
    infinite: movies?.length > 5,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, movies?.length || 2),
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
        Recommended Movies
      </h2>

      {movies?.length > 0 ? (
        <Slider {...settings}>
          {movies.map((movie) => (
            <div key={movie._id} className="px-3">
              <Link to={`/movie/${createSlug(movie.title)}/${movie._id}`}>
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={movie.movieimage}
                    alt={movie.title}
                    className="h-100 w-full object-cover rounded-xl hover:scale-105 transition duration-300 cursor-pointer"
                  />

                  <div className="mt-3 text-white">
                    <h3 className="font-bold text-lg">{movie.title}</h3>

                    <p className="text-sm text-white">
                      {movie.category?.join(" / ")}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-white">{error}</p>
      )}
      <p className="text-right text-white">
        <Link to={`/show-all-movies`}>See All</Link>
      </p>
    </section>
  );
};

export default MovieGallery;
