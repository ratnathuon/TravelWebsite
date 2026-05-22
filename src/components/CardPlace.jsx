import React, { useState } from 'react'

function CardPlace({ image, name, location, rating = 4 }) {
  const [liked, setLiked] = useState(() => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      return savedFavorites.some(place => place.name === name && place.image === image);
    } catch {
      return false;
    }
  });

  const handleLikeToggle = () => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      const isAlreadyLiked = savedFavorites.some(place => place.name === name && place.image === image);
      let updatedFavorites;
      if (isAlreadyLiked) {
        updatedFavorites = savedFavorites.filter(place => !(place.name === name && place.image === image));
      } else {
        updatedFavorites = [...savedFavorites, { image, name, location, rating }];
      }
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setLiked(!isAlreadyLiked);
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a] shadow-xl">

      {/* Image */}
      <div className="relative">
        <img
          className="p-2 rounded-3xl justify-self-center w-full h-52 object-cover"
          src={image}
          alt={name}
        />

        {/* Heart button */}
        <button
          onClick={handleLikeToggle}
          className="absolute top-0 left-2 bg-opacity-100 rounded-full p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'text-white fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Stars */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 22 20">
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
            </svg>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h5 className="text-white font-bold text-lg leading-tight">{name}</h5>
          <div className="flex items-center gap-1 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-gray-300 text-xs">{location}</span>
          </div>
        </div>
        <a href="#" className="text-teal-300 text-sm font-medium hover:text-white transition-colors">
          Explore
        </a>
      </div>

    </div>
  )
}

export default CardPlace