import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { MdLocationPin } from "react-icons/md";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { loadUser } from "./Header";
import { destinationsData } from "../data/destinationsData";

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
    const currentUser = loadUser();
    if (!currentUser) {
      window.dispatchEvent(new Event("openAccountModal"));
      window.dispatchEvent(new CustomEvent("showToast", { detail: "Please sign up or log in to add places to your favorites!" }));
      return;
    }
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
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: isAlreadyFaved ? "Removed from favorites!" : "Saved to favorites!"
        })
      );
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
      <div className="absolute bottom-0 left-0 right-0 py-2 sm:py-3 px-3 sm:px-4 bg-black/40 backdrop-blur-md border-t border-white/10 shadow-lg">
        <div className="flex justify-between items-end gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs sm:text-sm lg:text-base font-bold tracking-wide uppercase font-poppins truncate">
              {destination.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
              <MdLocationPin className="text-yellow-400 text-xs sm:text-sm shrink-0" />
              <span className="text-white/80 text-[11px] sm:text-xs font-poppins truncate">
                {destination.location}
              </span>
            </div>
          </div>
          <span className="text-white/80 text-xs font-medium font-poppins shrink-0 bg-white/20 px-2.5 py-0.5 rounded-full hover:bg-green-700 hover:text-white transition-colors">
            Explore
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CambodiaTravelExplorer() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "destinations"));
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map(doc => {
            const d = doc.data();
            const staticItem = destinationsData.find(st => st.id === d.id || st.name.toLowerCase() === d.name?.toLowerCase());
            return {
              name: d.name,
              location: d.location,
              cat: d.cat,
              stars: d.rating,
              img: staticItem?.img || d.img,
            };
          });
          setDestinations(data);
        } else {
          console.warn("Firestore collection 'destinations' is empty, using fallback static data.");
          setDestinations(destinationsData.map(d => ({
            name: d.name,
            location: d.location,
            cat: d.cat,
            stars: d.rating,
            img: d.img,
          })));
        }
      } catch (err) {
        console.error("Error fetching destinations for Category, using static fallback:", err);
        setDestinations(destinationsData.map(d => ({
          name: d.name,
          location: d.location,
          cat: d.cat,
          stars: d.rating,
          img: d.img,
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const scrollToExploreSection = () => {
    const element = document.getElementById("explore-section");
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToExploreSection();
  }, [currentPage, activeCategory]);

  useEffect(() => {
    const handleCategorySelectEvent = (e) => {
      const categoryValue = e.detail;
      if (categoryValue) {
        setActiveCategory(categoryValue);
        setCurrentPage(0);
        setTimeout(() => {
          scrollToExploreSection();
        }, 100);
      }
    };

    window.addEventListener("selectCategory", handleCategorySelectEvent);
    return () => window.removeEventListener("selectCategory", handleCategorySelectEvent);
  }, []);

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
        : cleanHash === "all" || cleanHash === "category" || cleanHash === "explore-section"
        ? "all"
        : null;
      if (categoryValue) {
        setActiveCategory(categoryValue);
        setCurrentPage(0);

        setTimeout(() => {
          scrollToExploreSection();
        }, 100);
      }
    }
  }, [location.hash]);

  useEffect(() => {
    if (!loading && location.hash) {
      setTimeout(() => {
        scrollToExploreSection();
      }, 100);
    }
  }, [loading, location.hash]);

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
    <div id="explore-section" className="scroll-mt-24 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 sm:py-8 font-poppins">
      {loading ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* Filter buttons */}
          <div className="flex flex-wrap mb-6 sm:mb-10 gap-2.5 sm:gap-4 justify-center lg:justify-between">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base border transition-all duration-150 font-poppins ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
        </>
      )}
    </div>
  );
}
