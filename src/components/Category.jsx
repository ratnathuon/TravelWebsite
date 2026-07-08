import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { MdLocationPin } from "react-icons/md";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { destinationsData } from "../data/destinationsData";

const destinations = destinationsData.map(d => ({
  name: d.name,
  location: d.location,
  cat: d.cat,
  stars: d.rating,
  img: d.img,
}));

const categories = [
  { label: "All Category", value: "all" },
  { label: "The Plains Region", value: "plains" },
  { label: "Tonle Sap Lake Area", value: "tonle" },
  { label: "Coastal Region", value: "coastal" },
  { label: "Mountain And Plateau Region", value: "mountain" },
];

const PAGE_SIZE = 9; // 3 cols x 3 rows

function StarRating({ count }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`w-5 h-5 ${i < count ? "text-yellow-400" : "text-white/30"}`}
        />
      ))}
    </div>
  );
}

function DestinationCard({ destination }) {
  const navigate = useNavigate();
  const [faved, setFaved] = useState(() => {
    try {
      const savedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
      return savedFavorites.some(
        (place) =>
          place.name === destination.name && place.image === destination.img,
      );
    } catch {
      return false;
    }
  });

  const handleFavedToggle = (e) => {
    e.stopPropagation();
    try {
      const savedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
      const isAlreadyFaved = savedFavorites.some(
        (place) =>
          place.name === destination.name && place.image === destination.img,
      );
      const updatedFavorites = isAlreadyFaved
        ? savedFavorites.filter(
            (place) =>
              !(
                place.name === destination.name &&
                place.image === destination.img
              ),
          )
        : [
            ...savedFavorites,
            {
              image: destination.img,
              name: destination.name,
              location: destination.location,
              rating: destination.stars,
            },
          ];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFaved(!isAlreadyFaved);
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      console.error("Failed to toggle destination favorite:", err);
    }
  };

  const handleCardClick = () => {
    navigate(`/explore/${encodeURIComponent(destination.name)}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-green-950 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
    >
      <img
        src={destination.img}
        alt={destination.name}
        className="w-full h-full object-cover"
      />

      {/* Stars */}
      <div className="absolute top-4 right-4">
        <StarRating count={destination.stars} />
      </div>

      {/* Favourite button */}
      <button
        onClick={handleFavedToggle}
        className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors duration-150"
        aria-label={`Favourite ${destination.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={faved ? "#ff2d55" : "none"}
          stroke={faved ? "#ff2d55" : "white"}
          strokeWidth={2}
          className={`w-6 h-6 transition-all duration-200 ${faved ? "scale-125" : "scale-100"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 pt-3 pb-3 px-5 bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white text-base font-bold tracking-widest uppercase font-poppins">
              {destination.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <MdLocationPin className="text-yellow-400 text-base" />
              <span className="text-white/70 text-sm font-poppins">
                {destination.location}
              </span>
            </div>
          </div>
          <span className="text-white/60 text-sm font-medium font-poppins">
            Explore
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CambodiaTravelExplorer() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const cleanHash = hash.replace("#", "");
      const match = categories.find(
        (cat) =>
          cat.value === cleanHash ||
          (cleanHash === "category" && cat.value === "all")
      );
      const categoryValue = match
        ? match.value
        : cleanHash === "all" || cleanHash === "category"
        ? "all"
        : null;
      if (categoryValue) {
        setActiveCategory(categoryValue);
        setCurrentPage(0);

        // Wait a small bit for render to complete, then scroll smoothly
        setTimeout(() => {
          const element = document.getElementById("explore-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, [location.hash]);

  const filtered =
    activeCategory === "all"
      ? destinations
      : destinations.filter((d) => d.cat === activeCategory);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  // Reset to page 0 when category changes
  const handleCategoryChange = (value) => {
    setActiveCategory(value);
    setCurrentPage(0);
  };

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const handleNext = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <div id="explore-section" className="w-full max-w-screen-2xl mx-auto px-14 sm:px-28 md:px-10 lg:px-20 xl:px-32 py-8 font-poppins">
      {/* Filter buttons */}
      <div className="flex flex-wrap justify-be mb-10 gap-4 justify-center lg:justify-between">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-sm sm:text-base border transition-all duration-150 font-poppins ${
              activeCategory === cat.value
                ? "bg-green-800 text-white border-green-800"
                : "bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg hover:border-gray-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
        {paginated.map((destination, i) => (
          <DestinationCard
            key={`${destination.name}-${currentPage}-${i}`}
            destination={destination}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-150
              ${
                currentPage === 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-green-800 text-green-800 hover:bg-green-800 hover:text-white"
              }`}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* Page dots */}
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentPage ? "w-6 bg-green-800" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-150
              ${
                currentPage === totalPages - 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-green-800 text-green-800 hover:bg-green-800 hover:text-white"
              }`}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
