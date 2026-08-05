import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { MdLocationPin } from "react-icons/md";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { loadUser } from "./Header";
import { destinationsData } from "../data/destinationsData";

const PAGE_SIZE = 3;

function StarRating({ count }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={`w-5 h-5 ${i < count ? "text-yellow-400" : "text-white/30"}`} />
      ))}
    </div>
  );
}

function DestinationCard({ destination, globalIndex, visible, exiting }) {
  const navigate = useNavigate();
  const [faved, setFaved] = useState(() => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      return savedFavorites.some(place => place.name === destination.name && place.image === destination.img);
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
      const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      const isAlreadyFaved = savedFavorites.some(place => place.name === destination.name && place.image === destination.img);
      let updatedFavorites;
      if (isAlreadyFaved) {
        updatedFavorites = savedFavorites.filter(place => !(place.name === destination.name && place.image === destination.img));
      } else {
        updatedFavorites = [...savedFavorites, { 
          image: destination.img, 
          name: destination.name, 
          location: destination.location, 
          rating: destination.stars 
        }];
      }
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFaved(!isAlreadyFaved);
      window.dispatchEvent(new Event('favoritesUpdated'));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: isAlreadyFaved ? "Removed from favorites!" : "Saved to favorites!"
        })
      );
    } catch (err) {
      console.error("Failed to toggle top place favorite:", err);
    }
  };

  const handleCardClick = () => {
    navigate(`/explore/${encodeURIComponent(destination.name)}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-3xl overflow-hidden aspect-[4/3] bg-green-950 cursor-pointer
        transition-all duration-600 ease-out hover:scale-[1.02]
        ${visible ? "opacity-100 translate-x-0" : exiting ? "opacity-0 translate-x-20" : "opacity-0 -translate-x-20"}`}
    >
      <img src={destination.img} alt={destination.name} className="w-full h-full object-cover" />

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
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
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
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

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
              stars: d.rating,
              img: staticItem?.img || d.img
            };
          });
          setDestinations(data);
        } else {
          console.warn("Firestore collection 'destinations' is empty, using fallback static data.");
          setDestinations(destinationsData.map(d => ({
            name: d.name,
            location: d.location,
            stars: d.rating,
            img: d.img
          })));
        }
      } catch (err) {
        console.error("Error fetching destinations for TopPlace, using static fallback:", err);
        setDestinations(destinationsData.map(d => ({
          name: d.name,
          location: d.location,
          stars: d.rating,
          img: d.img
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const totalPages = Math.ceil(destinations.length / PAGE_SIZE);

  const showPage = (page) => {
    if (totalPages === 0) return;
    setCurrentPage(page);
    setExiting(false);
    setVisibleCount(0);

    for (let i = 0; i < PAGE_SIZE; i++) {
      const t = setTimeout(() => setVisibleCount(i + 1), i * 350 + 100);
      timers.current.push(t);
    }

    const exitT = setTimeout(() => {
      setExiting(true);
      const nextT = setTimeout(() => {
        showPage((page + 1) % totalPages);
      }, 600);
      timers.current.push(nextT);
    }, PAGE_SIZE * 350 + 1400);
    timers.current.push(exitT);
  };

  useEffect(() => {
    if (!loading && destinations.length > 0) {
      clearTimers();
      showPage(0);
    }
    return () => clearTimers();
  }, [loading, destinations.length]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const pageDestinations = destinations.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 sm:py-8 font-poppins">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {pageDestinations.map((destination, i) => (
          <DestinationCard
            key={`${currentPage}-${i}`}
            destination={destination}
            visible={!exiting && visibleCount > i}
            exiting={exiting}
          />
        ))}
      </div>
    </div>
  );
}