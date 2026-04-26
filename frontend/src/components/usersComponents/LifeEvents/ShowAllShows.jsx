import React, { useState, useMemo, useEffect } from "react";
import FilterSidebar from "./LifeEvents_temp/FilterSidebar";
import ShowCard from "./LifeEvents_temp/ShowCard";
import { useParams } from "react-router-dom";
import BASE_URL from "../../../../config";

const ShowAllShows = () => {
  const { id } = useParams();
  const categoryId = id;
  const [shows, setShows] = useState([]);
  const [category, setCategory] = useState([]);

  const [subCategories, setSubCategories] = useState([]);
const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    genre: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, showsRes] = await Promise.all([
          fetch(`${BASE_URL}/user/get-maincategory/${categoryId}`),
          fetch(
            `${BASE_URL}/user/get-categorized-show/${categoryId}`,
          ),
        ]);

        const categoryData = await categoryRes.json();
        const showsData = await showsRes.json();

        setShows(showsData);
        setCategory(categoryData);
        const subCats =
          categoryData.subCategories?.map((sub) => sub.title) || [];

        setSubCategories(subCats);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [categoryId]);
// console.log(shows)

  // FILTER LOGIC
  const filteredShows = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return shows.filter((show) => {
    // ✅ GENRE FILTER
    if (
      selectedFilters.genre.length > 0 &&
      !selectedFilters.genre.some((g) =>
        show.subCategory?.includes(g)
      )
    ) {
      return false;
    }

    // ✅ MULTIPLE LOCATION CASE
    if (show.isMultipleLocation) {
      if (!show.locations || show.locations.length === 0) return false;

      const validLocations = show.locations.filter((loc) => loc.date);

      if (validLocations.length === 0) return false;

      const latestDate = validLocations.reduce((latest, loc) => {
        const d = new Date(loc.date);
        return d > latest ? d : latest;
      }, new Date(validLocations[0].date));

      latestDate.setHours(0, 0, 0, 0);

      return latestDate >= today;
    }

    // ✅ SINGLE LOCATION CASE (use startDate/endDate)
    if (show.startDate && show.endDate) {
      const end = new Date(show.endDate);
      end.setHours(0, 0, 0, 0);

      return end >= today;
    }

    return false;
  });
}, [shows, selectedFilters]);

  return (
    <div className="min-h-screen px-6 md:px-16 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-12">
        All Show under {category?.name}
      </h1>
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
            filters={{ genres: subCategories }}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
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
                filters={{ genres: subCategories }}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
            </div>
          </div>
        )}

        {/* Shows */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {" "}
            {filteredShows.map((show) => (
              <ShowCard key={show._id} show={show} />
            ))}
          </div>

          {filteredShows.length === 0 && (
            <p className="text-center text-gray-500 mt-20">No shows found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowAllShows;
