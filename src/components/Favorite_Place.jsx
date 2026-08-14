import React, { useState, useEffect } from 'react';
import CardPlace from './CardPlace';
import { loadUser } from './Header';
import { fetchUserFavoritesFromDb } from '../data/favoritesData';

export default function FavoritePlace() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const currentUser = loadUser();
            let list = await fetchUserFavoritesFromDb(currentUser);
            if (!list || list.length === 0) {
                try {
                    list = JSON.parse(localStorage.getItem('favorites')) || [];
                } catch {}
            }
            setFavorites(list || []);
        } catch (err) {
            console.error("Failed loading favorites from database:", err);
            try {
                const saved = JSON.parse(localStorage.getItem('favorites')) || [];
                setFavorites(saved);
            } catch {}
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFavorites();

        window.addEventListener('favoritesUpdated', loadFavorites);
        return () => window.removeEventListener('favoritesUpdated', loadFavorites);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="animate-spin h-8 w-8 text-[#28623a] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium text-gray-500">Loading favorite places...</p>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-80 text-gray-400 space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Favorite Places Saved Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm">Explore Cambodia destinations and tap the heart icon to save them to your database list.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {favorites.map((place, i) => (
                <CardPlace
                    key={place.id || place.name || i}
                    image={place.image || place.img}
                    name={place.name}
                    location={place.location}
                    rating={place.rating}
                />
            ))}
        </div>
    );
}
