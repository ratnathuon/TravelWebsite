import React, { useState, useEffect } from 'react';
import CardPlace from './CardPlace';

export default function FavoritePlace() {
    const [favorites, setFavorites] = useState([]);

    const loadFavorites = () => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(savedFavorites);
    };

    useEffect(() => {
        loadFavorites();

        // Listen for changes in favorites from other components
        window.addEventListener('favoritesUpdated', loadFavorites);
        return () => window.removeEventListener('favoritesUpdated', loadFavorites);
    }, []);

    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-80 text-gray-400 space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Favorites Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Explore places and tap the heart icon to save them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {favorites.map((place, i) => (
                <CardPlace key={i} {...place} />
            ))}
        </div>
    );
}
