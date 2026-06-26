import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLocationOn, MdSearch, MdClose } from "react-icons/md";
import { destinationsData } from "../data/destinationsData";

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Category");

  const categories = [
    "All Category",
    "The Plains Region",
    "Tonle Sap Lake Area",
    "Coastal Region",
    "Mountain and Plateau Region"
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPlaces = useMemo(() => {
    if (!normalizedQuery) return [];
    return destinationsData.filter((place) => {
      const haystack = [
        place.name,
        place.location,
        ...(place.searchNames || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!normalizedQuery) return;
    const targetPlace = filteredPlaces[0];
    if (targetPlace) {
      navigate(`/explore/${encodeURIComponent(targetPlace.name)}`);
      setQuery("");
    }
  };

  const handleSuggestionClick = (placeName) => {
    navigate(`/explore/${encodeURIComponent(placeName)}`);
    setQuery("");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <section className="flex justify-center">
      <form
        onSubmit={handleSearchSubmit}
        className="relative w-full max-w-2xl rounded-2xl p-2  ring-1 ring-white/10 z-50"
      >
        <label htmlFor="destination-search" className="sr-only">
          Search destinations
        </label>
        <div className="flex items-center gap-3 px-4 py-2 rounded-3xl border shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
          {/* Dropdown Button Inside Search Bar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm whitespace-nowrap"
            >
              {selectedCategory}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden min-w-max z-[9999]">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200"></div>

          <MdSearch className="h-6 w-6 text-slate-500" />
          <input
            id="destination-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places like Angkor Wat, Kep, or Koh Rong"
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none border-none focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MdClose className="h-5 w-5" />
            </button>
          )}
        </div>

        {normalizedQuery && (
          <div className="absolute left-4 right-4 top-[calc(100%-1rem)] z-[9999] rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl">
            {filteredPlaces.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">
                  Search results
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredPlaces.slice(0, 6).map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSuggestionClick(place.name)}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {place.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {place.location}
                        </p>
                      </div>
                      <MdLocationOn className="h-5 w-5 text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No destinations matched your search. Try another keyword.
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );
}