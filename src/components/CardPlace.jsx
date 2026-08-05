import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon, StarIcon } from "@heroicons/react/24/solid";
import { MdLocationPin } from "react-icons/md";
import { loadUser } from "./Header";

function CardPlace({ image, name, location, rating = 4 }) {
  const [liked, setLiked] = useState(() => {
    try {
      const savedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
      return savedFavorites.some(
        (place) => place.name === name && place.image === image,
      );
    } catch {
      return false;
    }
  });

  const handleLikeToggle = () => {
    const currentUser = loadUser();
    if (!currentUser) {
      window.dispatchEvent(new Event("openAccountModal"));
      window.dispatchEvent(new CustomEvent("showToast", { detail: "Please sign up or log in to add places to your favorites!" }));
      return;
    }
    try {
      const savedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
      const isAlreadyLiked = savedFavorites.some(
        (place) => place.name === name && place.image === image,
      );
      let updatedFavorites;
      if (isAlreadyLiked) {
        updatedFavorites = savedFavorites.filter(
          (place) => !(place.name === name && place.image === image),
        );
      } else {
        updatedFavorites = [
          ...savedFavorites,
          { image, name, location, rating },
        ];
      }
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setLiked(!isAlreadyLiked);
      window.dispatchEvent(new Event("favoritesUpdated"));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: isAlreadyLiked ? "Removed from favorites!" : "Saved to favorites!"
        })
      );
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative group overflow-hidden">
        <img
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
          src={image}
          alt={name}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={handleLikeToggle}
          className="absolute top-3 left-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
        >
          <HeartIcon
            className={`h-6 w-6 ${liked ? "text-red-500" : "text-white"}`}
          />
        </button>

        <div className="absolute top-4 right-3 z-20 flex items-center gap-1 rounded-full px-3 py-2 text-sm text-yellow-300">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${i < rating ? "text-yellow-400" : "text-white/30"}`}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-5 py-5">
          <div className="flex flex-col gap-3">
            
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="justify-between text-sm font-semibold text-white leading-tight">
                  {name}
                </h3>
              </div>
              <Link
                to={`/explore/${encodeURIComponent(name)}`}
                className=" justify-between inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-green-700 hover:text-white"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardPlace;
