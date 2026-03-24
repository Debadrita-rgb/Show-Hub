import React, { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import BASE_URL from "../../../../../config";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-movie`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API DATA:", data);
        setMovies(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} /> 
      ))}
    </div>
  );
};

export default MoviesPage;
