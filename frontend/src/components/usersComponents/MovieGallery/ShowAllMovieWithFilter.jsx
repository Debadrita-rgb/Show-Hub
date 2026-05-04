import React, { useState, useMemo, useEffect } from "react";
import FilterSidebar from "./MovieFilter_temp/FilterSidebar";
import MovieCard from "./MovieFilter_temp/MovieCard";
import BASE_URL from "../../../../config";

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

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const type = "Movie";

        const [moviesRes, genreRes, languageRes] = await Promise.all([
          // fetch("${BASE_URL}/user/get-movie"),
          fetch(`${BASE_URL}/user/getMoviesWithRatings`),
          fetch(`${BASE_URL}/admin/get-typewise-category/${type}`),
          fetch(`${BASE_URL}/user/get-language`),
        ]);

        const moviesData = await moviesRes.json();
        const genreData = await genreRes.json();
        const languageData = await languageRes.json();

        setMovies(moviesData.filter((m) => m.isActive));
        setGenres(genreData.filter((g) => g.isActive));
        setLanguages(languageData.filter((l) => l.isActive));
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

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
      if (!movie.isActive) return false;

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
      // SEARCH LOGIC
      const matchSearch = movie.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchLanguage && matchGenre && matchFormat && matchSearch;
    });
  }, [movies, selectedFilters, searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * moviesPerPage;
    return filteredMovies.slice(startIndex, startIndex + moviesPerPage);
  }, [filteredMovies, currentPage]);

  return (
    <div className="min-h-screen px-6 md:px-16 py-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">All Movies</h1>

        <div className="relative flex items-center justify-end">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 ">🔍</span>
        </div>
      </div>
      <button
        onClick={() => setShowFilters(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg"
      >
        ⚙️ Filters
      </button>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="hidden lg:block lg:w-1/4">
          <FilterSidebar
            filters={filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            ></div>

            <div className="relative w-3/4 max-w-sm bg-white h-full p-4 overflow-y-auto shadow-lg">
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

        <div className="lg:w-3/4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {paginatedMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <p className="text-center text-gray-500 mt-20">No movies found.</p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded disabled:opacity-50"
                >
                  {"<<"}
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded disabled:opacity-50"
                >
                  {"<"}
                </button>

                {(() => {
                  const pages = [];

                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 ||
                      i === totalPages ||
                      (i >= currentPage - 1 && i <= currentPage + 1)
                    ) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-4 py-2 rounded ${
                            currentPage === i
                              ? "bg-blue-600 text-white"
                              : "bg-purple-900 hover:bg-purple-800 text-white"
                          }`}

                          // className={`px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded disabled:opacity-50 ${
                          //   currentPage === i ? "bg-blue-500 text-white" : ""
                          // }`}
                        >
                          {i}
                        </button>,
                      );
                    } else if (i === currentPage - 2 || i === currentPage + 2) {
                      pages.push(
                        <span key={i} className="px-2 text-white">
                          ...
                        </span>,
                      );
                    }
                  }

                  return pages;
                })()}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded disabled:opacity-50"
                >
                  {">"}
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded disabled:opacity-50"
                >
                  {">>"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ShowAllMovieWithFilter;
