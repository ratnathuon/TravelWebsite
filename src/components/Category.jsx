import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { MdLocationPin } from "react-icons/md";

const destinations = [
  { name: "Khonh Rong", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1540202404-a2f29b7b4c62?w=800&q=80" },
  { name: "Kompot", location: "Kampot, Cambodia", cat: "coastal", stars: 4, img: "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=800&q=80" },
  { name: "Koh Han", location: "Kep, Cambodia", cat: "coastal", stars: 5, img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
  { name: "Kep", location: "Kep, Cambodia", cat: "coastal", stars: 5, img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
  { name: "Angkor Wat", location: "Siem Reap, Cambodia", cat: "plains", stars: 5, img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { name: "Green Field", location: "Mondulkiri, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80" },
  { name: "Khonh Rong", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80" },
  { name: "Koh Kong", location: "Koh Kong, Cambodia", cat: "coastal", stars: 5, img: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
  { name: "Veal Touch Waterfall", location: "Kep, Cambodia", cat: "mountain", stars: 5, img: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80" },
];

const categories = [
  { label: "All Category", value: "all" },
  { label: "The Plains Region", value: "plains" },
  { label: "Tonle Sap Lake Area", value: "tonle" },
  { label: "Coastal Region", value: "coastal" },
  { label: "Mountain And Plateau Region", value: "mountain" },
];

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
      console.error("Failed to toggle destination favorite:", err);
    }
  };

  const handleCardClick = () => {
    navigate(`/explore/${encodeURIComponent(destination.name)}`);
  };

  return (
    <div onClick={handleCardClick} className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-green-950 cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
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
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? destinations
      : destinations.filter((d) => d.cat === activeCategory);

  return (
    <div className="w-full px-60 py-8 font-poppins">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-6 py-2.5 rounded-full text-base border transition-all duration-150 font-poppins ${
              activeCategory === cat.value
                ? "bg-green-800 text-white border-green-800"
                : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filtered.map((destination, i) => (
          <DestinationCard key={`${destination.name}-${i}`} destination={destination} />
        ))}
      </div>
    </div>
  );
}