import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { destinationsData } from '../data/destinationsData';
import { compressImage, submitPendingUserPhotoToDb } from '../data/adminData';
import { toggleFavoriteInDb, fetchUserFavoritesFromDb } from '../data/favoritesData';
import { IoArrowBackOutline, IoShareOutline, IoHeartOutline, IoHeart, IoCreateOutline, IoThumbsUpOutline, IoThumbsUp, IoCameraOutline, IoCopyOutline, IoCheckmark } from 'react-icons/io5';
import { FaRegStar, FaStar, FaTelegram, FaFacebook, FaFacebookMessenger, FaWhatsapp } from 'react-icons/fa';
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

  // User Photo Upload State
  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpen] = useState(false);
  const [uploadPhotoInput, setUploadPhotoInput] = useState('');
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);
  const photoFileInputRef = useRef(null);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

        // Find match by id, exact name, or searchNames list
        let match = destinations.find(d =>
          d.id === placeName ||
          d.docId === placeName ||
          d.name?.toLowerCase() === nameClean ||
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

        // Prioritize uploaded img and gallery from database, fallback to staticMatch if missing
        const validGallery = (match.gallery && match.gallery.length > 0)
          ? match.gallery
          : (staticMatch?.gallery && staticMatch.gallery.length > 0)
            ? staticMatch.gallery
            : (match.img ? [match.img] : (staticMatch?.img ? [staticMatch.img] : []));

        match = {
          ...match,
          img: match.img || staticMatch?.img,
          gallery: validGallery,
        };

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
  const handleSaveToggle = async () => {
    if (!destination) return;
    if (!user) {
      window.dispatchEvent(new Event("openAccountModal"));
      showFeedbackToast("Please sign up or log in to save places to your favorites!");
      return;
    }
    try {
      const isAlreadySaved = favorites.some(
        (place) => place.name?.toLowerCase() === destination.name?.toLowerCase()
      );

      const updated = await toggleFavoriteInDb(user, destination);
      setFavorites(updated);
      showFeedbackToast(isAlreadySaved ? "Removed from saved places!" : "Saved to favorites!");
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
    setIsShareModalOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showFeedbackToast("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareTelegram = () => {
    const shareUrl = window.location.href;
    const shareText = `Explore ${destination?.name || 'this destination'} on Travel Cambodia!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const shareUrl = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareMessenger = () => {
    const shareUrl = window.location.href;
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsapp = () => {
    const shareUrl = window.location.href;
    const shareText = `Explore ${destination?.name || 'this destination'} on Travel Cambodia!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleReviewButtonClick = () => {
    reviewInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    reviewInputRef.current?.focus();
  };

  const handleViewLocationClick = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPhotoUpload = () => {
    if (!user) {
      window.dispatchEvent(new Event("openAccountModal"));
      showFeedbackToast("Please log in to submit a photo!");
      return;
    }
    setUploadPhotoInput('');
    setIsUploadPhotoModalOpen(true);
  };

  const handlePhotoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1000, 1000, 0.7);
      setUploadPhotoInput(compressed);
      showFeedbackToast("Photo loaded & compressed! Ready to submit.");
    } catch (err) {
      console.error("Photo compression error:", err);
      showFeedbackToast("Failed to process image file.");
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmitUserPhoto = async (e) => {
    e.preventDefault();
    if (!uploadPhotoInput || !uploadPhotoInput.trim()) {
      showFeedbackToast("Please select a photo file or enter an image URL.");
      return;
    }

    if (!user) {
      window.dispatchEvent(new Event("openAccountModal"));
      showFeedbackToast("Please log in to submit a photo!");
      return;
    }

    setIsSubmittingPhoto(true);
    try {
      const docId = destination.docId || destination.id;
      const photoItem = {
        id: `photo_${Date.now()}`,
        url: uploadPhotoInput.trim(),
        submittedBy: user.email || user.name || "User",
        submittedAt: new Date().toISOString(),
        destinationName: destination.name,
        destinationDocId: docId
      };

      await submitPendingUserPhotoToDb(docId, photoItem);

      showFeedbackToast("Photo submitted! It will appear in the gallery once approved by an admin.");
      setIsUploadPhotoModalOpen(false);
      setUploadPhotoInput('');
    } catch (err) {
      console.error("Error submitting user photo:", err);
      showFeedbackToast("Failed to submit photo. Please try again.");
    } finally {
      setIsSubmittingPhoto(false);
    }
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

            {/* Add Photo Button for Users */}
            <button
              onClick={handleOpenPhotoUpload}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-green-800 hover:bg-green-900 text-white rounded-full shadow-md text-xs sm:text-sm font-bold transition-all duration-150 transform hover:scale-105"
              title="Upload your photo to this destination gallery"
            >
              <IoCameraOutline className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
              <span>Add Photo</span>
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
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Photo Gallery ({gallery.length} Photos)
                </span>
                <button
                  onClick={handleOpenPhotoUpload}
                  className="text-xs text-green-800 hover:text-green-950 font-bold flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-full border border-green-200 transition-colors"
                >
                  <IoCameraOutline className="w-4 h-4" />
                  <span>+ Upload Photo</span>
                </button>
              </div>

              {gallery.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative flex-shrink-0 w-28 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${(selectedImage || destination.img) === imgUrl
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
              )}
            </div>

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
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-4 sm:gap-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Review</h2>

            {/* Review Input */}
            <form onSubmit={handleAddReview} className="flex gap-2 items-center w-full">
              <input
                ref={reviewInputRef}
                type="text"
                placeholder="Add a review..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-w-0 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl py-2.5 px-3.5 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-800/30 focus:border-green-800 font-poppins"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-green-800 hover:bg-green-950 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl shadow-md transition-colors shrink-0"
              >
                Post
              </button>
            </form>

            {/* Reviews List */}
            <div className="flex flex-col gap-3 sm:gap-4 overflow-y-auto max-h-[360px] pr-1">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-gray-50 hover:bg-gray-100/70 border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <img
                      src={rev.avatar}
                      alt={rev.username}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="block font-bold text-xs sm:text-sm text-gray-900 truncate">{rev.username}</span>
                      <p className="text-gray-500 text-[11px] sm:text-xs truncate mt-0.5 max-w-[150px] sm:max-w-[280px]">
                        {rev.comment}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleLikeReview(rev.id)}
                      className={`flex items-center gap-1 text-[11px] sm:text-xs hover:text-green-800 transition-colors ${likedReviews[rev.id] ? 'text-green-800 font-semibold' : 'text-gray-400'}`}
                    >
                      {likedReviews[rev.id] ? <IoThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <IoThumbsUpOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      <span>{rev.likes}</span>
                    </button>

                    <button
                      onClick={() => setActiveReviewDetail(rev)}
                      className="text-[11px] sm:text-xs text-blue-500 hover:underline font-semibold"
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

      {/* Upload Photo Modal */}
      {isUploadPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fade-in border border-gray-100 font-poppins relative">
            <button
              onClick={() => setIsUploadPhotoModalOpen(false)}
              disabled={isSubmittingPhoto}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <IoCameraOutline className="w-6 h-6 text-green-800" />
              <h3 className="text-xl font-bold text-gray-900">Upload Gallery Photo</h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Submit your photo for <span className="font-bold text-gray-700">{destination.name}</span>. It will be added to the destination gallery once approved by an admin!
            </p>

            <form onSubmit={handleSubmitUserPhoto} className="space-y-4">
              {/* File Upload Button & URL input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Photo File or Paste URL
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={uploadPhotoInput}
                    onChange={(e) => setUploadPhotoInput(e.target.value)}
                    placeholder="Paste image URL or choose file..."
                    className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                  <input
                    type="file"
                    ref={photoFileInputRef}
                    onChange={handlePhotoFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-green-800 hover:bg-green-900 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              {/* Photo Live Preview */}
              {uploadPhotoInput ? (
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border-2 border-green-800/40 shadow-md bg-gray-900 group">
                  <img
                    src={uploadPhotoInput}
                    alt="User Upload Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full border border-white/20 font-medium">
                    📸 Photo Preview
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadPhotoInput('')}
                    className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50">
                  <IoCameraOutline className="w-8 h-8 text-gray-400 mx-auto mb-1 opacity-60" />
                  <p className="text-xs text-gray-500 font-medium">Select a local photo file or paste image URL above.</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadPhotoModalOpen(false)}
                  disabled={isSubmittingPhoto}
                  className="px-5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPhoto || !uploadPhotoInput}
                  className="px-6 py-2 bg-green-800 hover:bg-green-900 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingPhoto ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit for Admin Approval</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Destination Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative animate-scale-up">
            {/* Close button */}
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Share Destination</h3>
              <p className="text-xs text-gray-500 mt-1 truncate px-4">
                {destination?.name} • {destination?.location || 'Cambodia'}
              </p>
            </div>

            {/* Destination Thumbnail Preview */}
            {destination && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-5">
                <img
                  src={selectedImage || destination.img}
                  alt={destination.name}
                  className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0"
                />
                <div className="overflow-hidden text-left">
                  <h4 className="font-bold text-sm text-gray-800 truncate">{destination.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{destination.location || 'Cambodia'}</p>
                </div>
              </div>
            )}

            {/* Share App Options Grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-gray-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-transform group-hover:scale-110 shadow-sm">
                  {copiedLink ? (
                    <IoCheckmark className="w-6 h-6 text-green-600 stroke-2" />
                  ) : (
                    <IoCopyOutline className="w-6 h-6 text-gray-700" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-gray-700">Copy Link</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleShareTelegram}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-sky-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#0088cc]/10 group-hover:bg-[#0088cc]/20 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                  <FaTelegram className="w-6 h-6 text-[#0088cc]" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700">Telegram</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 group-hover:bg-[#1877F2]/20 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                  <FaFacebook className="w-6 h-6 text-[#1877F2]" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700">Facebook</span>
              </button>

              {/* Messenger */}
              <button
                onClick={handleShareMessenger}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#0099FF]/10 group-hover:bg-[#0099FF]/20 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                  <FaFacebookMessenger className="w-6 h-6 text-[#0099FF]" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700">Messenger</span>
              </button>
            </div>

            {/* Direct URL Input Row */}
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-2xl border border-gray-200">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-transparent text-[11px] text-gray-600 px-2 outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 bg-[#28623a] hover:bg-[#1e4b2c] text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
              >
                {copiedLink ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 