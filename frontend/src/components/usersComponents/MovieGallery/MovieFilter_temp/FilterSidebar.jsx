import React from "react";

const FilterSection = ({ title, options, selected, toggleOption, onClear }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold capitalize">{title}</h3>

        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => toggleOption(title, option)}
            className={`px-3 py-1 text-sm rounded-md border transition
              ${
                selected.includes(option)
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const FilterSidebar = ({ filters, selectedFilters, setSelectedFilters }) => {
  const toggleOption = (category, option) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];

      if (current.includes(option)) {
        return {
          ...prev,
          [category]: current.filter((item) => item !== option),
        };
      } else {
        return {
          ...prev,
          [category]: [...current, option],
        };
      }
    });
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg sticky top-24 text-black">

      <FilterSection
        title="language"
        options={filters.languages}
        selected={selectedFilters.language}
        toggleOption={toggleOption}
        onClear={() =>
          setSelectedFilters((prev) => ({
            ...prev,
            language: [],
          }))
        }
      />

      <FilterSection
        title="genre"
        options={filters.genres}
        selected={selectedFilters.genre}
        toggleOption={toggleOption}
        onClear={() =>
          setSelectedFilters((prev) => ({
            ...prev,
            genre: [],
          }))
        }
      />

      <FilterSection
        title="format"
        options={filters.formats}
        selected={selectedFilters.format}
        toggleOption={toggleOption}
        onClear={() =>
          setSelectedFilters((prev) => ({
            ...prev,
            format: [],
          }))
        }
      />
    </div>
  );
};
export default FilterSidebar;
