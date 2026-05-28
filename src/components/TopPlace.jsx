import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { MdLocationPin } from "react-icons/md";

const destinations = [
  { name: "Khonh Rong", location: "Kep, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1540202404-a2f29b7b4c62?w=800&q=80" },
  { name: "Kompot", location: "Kampot, Cambodia", stars: 4, img: "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=800&q=80" },
  { name: "Koh Han", location: "Kep, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
  { name: "Kep", location: "Kep, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
  { name: "Angkor Wat", location: "Siem Reap, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { name: "Green Field", location: "Mondulkiri, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80" },
  { name: "Khonh Rong 2", location: "Kep, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80" },
  { name: "Koh Kong", location: "Koh Kong, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
];

const PAGE_SIZE = 3;
const totalPages = Math.ceil(destinations.length / PAGE_SIZE);

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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pt-16 pb-5 px-5">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white text-base font-bold tracking-widest uppercase font-poppins">
              {destination.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <MdLocationPin className="text-yellow-400 text-base" />
              <span className="text-white/70 text-sm font-poppins">{destination.location}</span>
            </div>
          </div>
          <span className="text-white/60 text-sm font-medium font-poppins">Explore</span>
        </div>
      </div>
    </div>
  );
}

export default function CambodiaTravelExplorer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const showPage = (page) => {
    setCurrentPage(page);
    setExiting(false);
    setVisibleCount(0);

    // Slide cards in one by one
    for (let i = 0; i < PAGE_SIZE; i++) {
      const t = setTimeout(() => setVisibleCount(i + 1), i * 350 + 100);
      timers.current.push(t);
    }

    // After all shown, start exit then go to next page
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
    showPage(0);
    return () => clearTimers();
  }, []);

  const pageDestinations = destinations.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="w-full px-60 py-8 font-poppins">
      <div className="grid grid-cols-3 gap-6">
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