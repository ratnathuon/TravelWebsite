import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { destinationsData } from '../data/destinationsData';
import { IoArrowBackOutline, IoShareOutline, IoHeartOutline, IoHeart, IoCreateOutline, IoThumbsUpOutline, IoThumbsUp } from 'react-icons/io5';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { MdLocationPin } from 'react-icons/md';
import Footer from '../components/Footer';
export default function ExploreDetail() {
  const { placeName } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const reviewInputRef = useRef(null);

  // State
  const [destination, setDestination] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites')) || [];
    } catch {
      return [];
    }
  });

  const isSaved = favorites.some(
    (place) => place.name.toLowerCase() === destination?.name.toLowerCase()
  );

  const [likedReviews, setLikedReviews] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeReviewDetail, setActiveReviewDetail] = useState(null);

  // Get active user if signed in
  const [user, setUser] = useState(() => {
    try {
      const rawUser = localStorage.getItem('travel_cambodia_user');
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [placeName]);

  useEffect(() => {
    const fetchDestinationData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "destinations"));
        let destinations = [];
        if (!querySnapshot.empty) {
          destinations = querySnapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
          }));
        } else {
          console.warn("Firestore collection 'destinations' is empty, using fallback static data.");
          destinations = destinationsData;
        }

        const decodedName = decodeURIComponent(placeName || '');
        const nameClean = decodedName.trim().toLowerCase();

        // Find match where searchName is included in searchNames list
        let match = destinations.find(d =>
          d.searchNames?.some(sn => nameClean.includes(sn) || sn.includes(nameClean))
        );

        const staticMatch = destinationsData.find(d =>
          d.id === match?.id || d.searchNames?.some(sn => nameClean.includes(sn) || sn.includes(nameClean))
        );

        if (!match) {
          // Fallback default details if not found
          match = staticMatch || {
            id: "default-place",
            name: decodedName,
            location: "Cambodia",
            rating: 4,
            img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
            about: `Explore the breathtaking beauty of ${decodedName} in Cambodia. Immerse yourself in the rich local culture, historical landmarks, and scenic natural views that make this destination a unique travel experience.`,
            mapSearch: `${decodedName}, Cambodia`,
            reviews: [
              {
                id: "def1",
                username: "Ratna",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                comment: "That looking grate! Highly recommend visiting this wonderful spot.",
                likes: 3
              }
            ]
          };
        }

        // Attach valid image & gallery assets from static data when available
        if (staticMatch) {
          const validGallery = (staticMatch.gallery && staticMatch.gallery.length > 0)
            ? staticMatch.gallery
            : [staticMatch.img];

          match = {
            ...match,
            img: staticMatch.img || match.img,
            gallery: validGallery,
          };
        } else {
          const validGallery = (match.gallery && match.gallery.length > 0)
            ? match.gallery
            : (match.img ? [match.img] : []);
          match = { ...match, gallery: validGallery };
        }

        setDestination(match);
        setSelectedImage(match.gallery?.[0] || match.img);
        setReviews(match.reviews || []);
      } catch (err) {
        console.error("Error loading destination details, using static fallback:", err);
        const decodedName = decodeURIComponent(placeName || '');
        const nameClean = decodedName.trim().toLowerCase();
        let match = destinationsData.find(d =>
          d.searchNames?.some(sn => nameClean.includes(sn) || sn.includes(nameClean))
        );
        if (!match) {
          match = {
            id: "default-place",
            name: decodedName,
            location: "Cambodia",
            rating: 4,
            img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
            about: `Explore the breathtaking beauty of ${decodedName} in Cambodia. Immerse yourself in the rich local culture, historical landmarks, and scenic natural views that make this destination a unique travel experience.`,
            mapSearch: `${decodedName}, Cambodia`,
            reviews: [
              {
                id: "def1",
                username: "Ratna",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                comment: "That looking grate! Highly recommend visiting this wonderful spot.",
                likes: 3
              }
            ]
          };
        }
        setDestination(match);
        setSelectedImage(match.gallery?.[0] || match.img);
        setReviews(match.reviews || []);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationData();
  }, [placeName]);

  const gallery = destination?.gallery?.length 
    ? destination.gallery 
    : (destination?.img ? [destination.img] : []);

  // Sync favorites state
  const handleSaveToggle = () => {
    if (!destination) return;
    if (!user) {
      window.dispatchEvent(new Event("openAccountModal"));
      showFeedbackToast("Please sign up or log in to save places to your favorites!");
      return;
    }
    try {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      const isAlreadySaved = savedFavorites.some(
        (place) => place.name.toLowerCase() === destination.name.toLowerCase()
      );

      let updatedFavorites;
      if (isAlreadySaved) {
        updatedFavorites = savedFavorites.filter(
          (place) => place.name.toLowerCase() !== destination.name.toLowerCase()
        );
        showFeedbackToast("Removed from saved places!");
      } else {
        updatedFavorites = [
          ...savedFavorites,
          {
            name: destination.name,
            image: destination.img,
            location: destination.location,
            rating: destination.rating,
          },
        ];
        showFeedbackToast("Saved to favorites!");
      }
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const showFeedbackToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showFeedbackToast("Link copied to clipboard!");
  };

  const handleReviewButtonClick = () => {
    reviewInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    reviewInputRef.current?.focus();
  };

  const handleViewLocationClick = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLikeReview = async (reviewId) => {
    if (!destination) return;
    if (!user) {
      window.dispatchEvent(new Event("openAccountModal"));
      showFeedbackToast("Please sign up or log in to like reviews!");
      return;
    }

    const wasLiked = likedReviews[reviewId];
    const updatedReviews = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          likes: wasLiked ? r.likes - 1 : r.likes + 1,
        };
      }
      return r;
    });

    if (destination.docId) {
      try {
        const docRef = doc(db, "destinations", destination.docId);
        await updateDoc(docRef, {
          reviews: updatedReviews
        });
      } catch (err) {
        console.error("Failed to update likes in Firestore:", err);
      }
    }

    setReviews(updatedReviews);
    setLikedReviews((prev) => ({
      ...prev,
      [reviewId]: !wasLiked,
    }));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      window.dispatchEvent(new Event("openAccountModal"));
      showFeedbackToast("Please sign up or log in to post a review!");
      return;
    }
    if (!newComment.trim() || !destination) return;

    const newReview = {
      id: `custom-${Date.now()}`,
      username: user ? user.name : "Guest Explorer",
      avatar: user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      comment: newComment.trim(),
      likes: 0
    };

    const updatedReviews = [newReview, ...reviews];

    if (destination.docId) {
      try {
        const docRef = doc(db, "destinations", destination.docId);
        await updateDoc(docRef, {
          reviews: updatedReviews
        });
      } catch (err) {
        console.error("Failed to persist review in Firestore:", err);
      }
    }

    setReviews(updatedReviews);
    setNewComment('');
    showFeedbackToast("Review posted successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-500 font-poppins">
        <h2 className="text-2xl font-bold">Destination Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-green-800 text-white rounded-full">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-poppins text-gray-800 flex flex-col justify-between">

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#1e5e2e] text-white py-3 px-6 rounded-2xl shadow-2xl flex items-center gap-2 border border-green-700 animate-slide-up">
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12 sm:pb-16 w-full flex-1">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 sm:p-3 bg-white rounded-full shadow-md hover:shadow-lg text-gray-600 hover:text-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-800/30"
          aria-label="Go Back"
        >
          <IoArrowBackOutline className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3px]" />
        </button>

        {/* Stats and Action Bar */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 pb-4 sm:pb-6 border-b border-gray-100 gap-3 sm:gap-4">
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-yellow-200">
              <span className="font-bold text-xs sm:text-sm">Rate</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < destination.rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>

            <button
              onClick={handleViewLocationClick}
              className="flex items-center gap-1.5 text-gray-600 hover:text-green-800 font-semibold text-xs sm:text-sm transition-colors duration-150"
            >
              <MdLocationPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span>View Location</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-xs sm:text-sm font-bold text-gray-600 hover:text-green-800 transition-all duration-150"
            >
              <IoShareOutline className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSaveToggle}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-xs sm:text-sm font-bold text-gray-600 hover:text-red-500 transition-all duration-150"
            >
              {isSaved ? (
                <IoHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
              ) : (
                <IoHeartOutline className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
              )}
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={handleReviewButtonClick}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-xs sm:text-sm font-bold text-gray-600 hover:text-green-800 transition-all duration-150"
            >
              <IoCreateOutline className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
              <span>Review</span>
            </button>
          </div>
        </div>

        {/* Vertical Stack Content Layout */}
        <div className="flex flex-col gap-6 sm:gap-8 mt-6 sm:mt-8">
          
          {/* Place Details Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 sm:mb-6">
              {destination.name}
            </h1>

            {/* Featured Main Image */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg mb-4 max-h-[320px] sm:max-h-[420px] md:max-h-[520px]">
              <img 
                src={selectedImage || destination.img} 
                alt={destination.name} 
                className="w-full h-full object-cover transition-all duration-300" 
                style={{ maxHeight: '480px' }}
              />
            </div>

            {/* Photo Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="mb-8">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Photo Gallery ({gallery.length} Photos)
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative flex-shrink-0 w-28 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        (selectedImage || destination.img) === imgUrl
                          ? 'border-green-800 ring-2 ring-green-800/40 scale-105 shadow-md'
                          : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${destination.name} photo ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 relative pl-3 border-l-4 border-green-800">
                About
              </h2>
              <p className="text-gray-600 leading-relaxed text-base font-normal whitespace-pre-line">
                {destination.about}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900">Review</h2>
            
            {/* Review Input */}
            <form onSubmit={handleAddReview} className="flex gap-2 items-center">
              <input 
                ref={reviewInputRef}
                type="text" 
                placeholder="Add a review..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-2xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-800/30 focus:border-green-800 font-poppins"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-green-800 hover:bg-green-950 text-white text-sm font-semibold rounded-2xl shadow-md transition-colors"
              >
                Post
              </button>
            </form>

            {/* Reviews List */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[360px] pr-1">
              {reviews.map((rev) => (
                <div 
                  key={rev.id}
                  className="bg-gray-50 hover:bg-gray-100/70 border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img 
                      src={rev.avatar} 
                      alt={rev.username} 
                      className="w-11 h-11 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="block font-bold text-sm text-gray-900">{rev.username}</span>
                      <p className="text-gray-500 text-xs truncate mt-0.5 max-w-[280px]">
                        {rev.comment}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button 
                      onClick={() => handleLikeReview(rev.id)}
                      className={`flex items-center gap-1 text-xs hover:text-green-800 transition-colors ${likedReviews[rev.id] ? 'text-green-800 font-semibold' : 'text-gray-400'}`}
                    >
                      {likedReviews[rev.id] ? <IoThumbsUp className="w-4 h-4" /> : <IoThumbsUpOutline className="w-4 h-4" />}
                      <span>{rev.likes}</span>
                    </button>

                    <button 
                      onClick={() => setActiveReviewDetail(rev)}
                      className="text-xs text-blue-500 hover:underline font-semibold"
                    >
                      See Detail
                    </button>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No reviews yet. Be the first to add one!</p>
              )}
            </div>
          </div>

          {/* Map Section */}
          <div ref={mapRef} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Map</h2>
            
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-gray-150 shadow-inner relative">
              <iframe
                title="location-map"
                className="w-full h-full border-0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(destination.mapSearch)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

        </div>

      </div>

      {/* Review Detail Modal */}
      {activeReviewDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in border border-gray-100">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img
                src={activeReviewDetail.avatar}
                alt={activeReviewDetail.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <span className="block font-bold text-lg text-gray-900">{activeReviewDetail.username}</span>
                <span className="text-xs text-gray-400">Review Details</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed my-6 font-normal">
              "{activeReviewDetail.comment}"
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveReviewDetail(null)}
                className="px-6 py-2 bg-green-800 hover:bg-green-900 text-white font-semibold text-sm rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
} 