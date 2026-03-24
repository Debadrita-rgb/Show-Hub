import React, { useState, useMemo, useEffect } from "react";
import FilterSidebar from "./MovieFilter_temp/FilterSidebar";
import MovieCard from "./MovieFilter_temp/MovieCard";

const ShowAllMovieWithFilter = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    language: [],
    genre: [],
    format: [],
  });

  useEffect(() => { 
    const fetchData = async () => {
      try {
                const type = "Movie";

        const [moviesRes, genreRes, languageRes] = await Promise.all([
          // fetch("http://localhost:5000/user/get-movie"),
          fetch("http://localhost:5000/user/getMoviesWithRatings"),
          fetch(`http://localhost:5000/admin/get-typewise-category/${type}`),
          fetch("http://localhost:5000/user/get-language"),
        ]);

        const moviesData = await moviesRes.json();
        const genreData = await genreRes.json();
        const languageData = await languageRes.json();

        setMovies(moviesData);
        setGenres(genreData.filter((g) => g.isActive));
        setLanguages(languageData.filter((l) => l.isActive));
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);
// console.log(movies)
  // Generate filters dynamically from API movies
  const filters = useMemo(
    () => ({
      languages: languages.map((l) => l.title),
      genres: genres.map((g) => g.name),
      formats: [...new Set(movies.flatMap((m) => m.format || []))],
    }),
    [languages, genres, movies],
  );

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const movieLanguages = Array.isArray(movie.language)
        ? movie.language
        : [movie.language];

      const movieGenres = Array.isArray(movie.category)
        ? movie.category
        : [movie.category];

      const movieFormats = Array.isArray(movie.format)
        ? movie.format
        : [movie.format];

      const normalize = (arr) =>
        arr.map((item) => String(item).trim().toLowerCase());

      const normalizedLanguages = normalize(movieLanguages);
      const normalizedGenres = normalize(movieGenres);
      const normalizedFormats = normalize(movieFormats);

      const matchLanguage =
        selectedFilters.language.length === 0 ||
        selectedFilters.language.some((l) =>
          normalizedLanguages.includes(l.toLowerCase()),
        );

      const matchGenre =
        selectedFilters.genre.length === 0 ||
        selectedFilters.genre.some((g) =>
          normalizedGenres.includes(g.toLowerCase()),
        );

      const matchFormat =
        selectedFilters.format.length === 0 ||
        selectedFilters.format.some((f) =>
          normalizedFormats.includes(f.toLowerCase()),
        );

      return matchLanguage && matchGenre && matchFormat;
    });
  }, [movies, selectedFilters]);


  return (
    <div className="min-h-screen px-6 md:px-16 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-12">All Movies </h1>
      <button
        onClick={() => setShowFilters(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg"
      >
        ⚙️ Filters
      </button>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-1/4">
          <FilterSidebar
            filters={filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
        {/* Mobile / Tablet Filter Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            ></div>

            {/* Drawer */}
            <div className="relative w-3/4 max-w-sm bg-white h-full p-4 overflow-y-auto shadow-lg">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <FilterSidebar
                filters={filters}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
            </div>
          </div>
        )}
        {/* Movies Grid */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <p className="text-center text-gray-500 mt-20">No movies found.</p>
          )}
        </div>
      </div>
    </div>
  );
};;
export default ShowAllMovieWithFilter;
