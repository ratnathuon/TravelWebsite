import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { clearUser, checkIsAdmin } from './Header';
import { saveUserProfileToDb, fetchUserProfileFromDb } from '../data/userData';
import { fetchSystemAdminsFromDb } from '../data/adminData';
import FavoritePlace from './Favorite_Place';

export default function AccountInfo({ user, onUpdateUser, onSignOut }) {
    const displayUser = user || {
        name: 'Guest Explorer',
        email: 'Sign up to sync your profile',
        initials: 'G',
        photoURL: null,
    };

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';
    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };
    const navigate = useNavigate();

    const [isAdmin, setIsAdmin] = useState(() => checkIsAdmin(user));
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
    const [previewPhotoURL, setPreviewPhotoURL] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);

    const currentDisplayPhoto = removePhoto ? null : (previewPhotoURL || displayUser.photoURL);

    useEffect(() => {
        setIsAdmin(checkIsAdmin(user));
        if (user?.email) {
            fetchSystemAdminsFromDb().then((admins) => {
                const clean = user.email.toLowerCase().trim();
                if (admins.some((a) => (a || "").toLowerCase().trim() === clean)) {
                    setIsAdmin(true);
                }
            });
        }
    }, [user]);

    const getNames = (fullName) => {
        const parts = (fullName || '').trim().split(/\s+/);
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        return { firstName, lastName };
    };

    const { firstName: initialFirstName, lastName: initialLastName } = getNames(displayUser.name);

    const [formData, setFormData] = useState({
        firstName: initialFirstName,
        lastName: initialLastName,
        phone: displayUser.phone || '',
        location: displayUser.location || '',
        bio: displayUser.bio || ''
    });

    useEffect(() => {
        let isMounted = true;
        const loadProfile = async () => {
            const { firstName, lastName } = getNames(displayUser.name);
            let fName = displayUser.firstName || firstName;
            let lName = displayUser.lastName || lastName;
            let phone = displayUser.phone || '';
            let location = displayUser.location || '';
            let bio = displayUser.bio || '';

            if (user) {
                const dbProfile = await fetchUserProfileFromDb(user);
                if (dbProfile && isMounted) {
                    if (dbProfile.firstName) fName = dbProfile.firstName;
                    if (dbProfile.lastName) lName = dbProfile.lastName;
                    if (dbProfile.phone) phone = dbProfile.phone;
                    if (dbProfile.location) location = dbProfile.location;
                    if (dbProfile.bio) bio = dbProfile.bio;
                }
            }

            if (isMounted) {
                setFormData({
                    firstName: fName,
                    lastName: lName,
                    phone,
                    location,
                    bio,
                });
            }
        };

        loadProfile();
        return () => { isMounted = false; };
    }, [user]);

    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        if (!user) {
            alert("Please sign up or log in to save your profile changes permanently!");
            return;
        }
        setIsSaving(true);
        setSaveSuccess(false);

        let finalPhotoURL = displayUser.photoURL;

        if (removePhoto) {
            finalPhotoURL = null;
            if (auth.currentUser) updateProfile(auth.currentUser, { photoURL: null }).catch(() => { });
        } else if (pendingPhotoFile && previewPhotoURL) {
            finalPhotoURL = previewPhotoURL;
        }

        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

        if (auth.currentUser) {
            updateProfile(auth.currentUser, { displayName: fullName }).catch(() => { });
        }

        const profilePayload = {
            name: fullName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            photoURL: finalPhotoURL,
        };

        await saveUserProfileToDb(user, profilePayload);

        if (onUpdateUser) {
            onUpdateUser({
                ...displayUser,
                ...profilePayload,
            });
        }

        setPendingPhotoFile(null);
        setRemovePhoto(false);

        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleFileChange = (e) => {
        if (!user) {
            alert("Please sign up or log in to upload a profile picture!");
            return;
        }
        const file = e.target.files[0];
        if (file) {
            setPendingPhotoFile(file);
            setRemovePhoto(false);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPhotoURL(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        if (!user) return;
        setPendingPhotoFile(null);
        setPreviewPhotoURL(null);
        setRemovePhoto(true);
    };

    const handleSignOut = () => {
        import("firebase/auth").then(({ getAuth, signOut }) => {
            const authInstance = getAuth();
            signOut(authInstance).catch(() => console.log("Firebase signout error"));
        });
        clearUser();
        if (onSignOut) {
            onSignOut();
        }
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pt-4 sm:pt-10 pb-16 font-poppins">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

                {/* Page Title */}
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
                    <p className="text-gray-500 mt-1 text-xs sm:text-lg">Manage your profile, security, and favorite places.</p>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-gray-100">

                    {/* Sidebar / Mobile Top Bar */}
                    <div className="w-full md:w-80 bg-gradient-to-br from-[#0F2027] via-[#204E2E] to-[#28623a] text-white p-4 sm:p-8 shrink-0">
                        {/* Profile Info Header */}
                        <div className="flex items-center justify-between md:justify-start md:space-x-5 mb-4 sm:mb-12">
                            <div className="flex items-center space-x-3 sm:space-x-5 overflow-hidden">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold border-2 border-white/20 shadow-lg overflow-hidden">
                                    {currentDisplayPhoto ? (
                                        <img src={currentDisplayPhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        displayUser.initials
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-sm sm:text-xl truncate text-white">{displayUser.name}</h3>
                                        {isAdmin && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-mono font-bold shrink-0">
                                                ADMIN
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-300 truncate opacity-80">{displayUser.email}</p>
                                </div>
                            </div>

                            {/* Mobile Quick Signout Icon Button */}
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to sign out?")) {
                                        handleSignOut();
                                    }
                                }}
                                className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 transition-colors shrink-0"
                                title="Sign Out"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Tabs (Mobile Horizontal Pills / Desktop Vertical Stack) */}
                        <nav className="flex md:flex-col overflow-x-auto gap-2 scrollbar-none pb-1 md:pb-0">
                            {[
                                { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                { id: 'favorites', label: 'Favorite places', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                                { id: 'signout', label: 'Sign out', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', isDesktopOnly: true }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (tab.id === 'signout') {
                                            if (window.confirm("Are you sure you want to sign out?")) {
                                                handleSignOut();
                                            }
                                        } else {
                                            setActiveTab(tab.id);
                                        }
                                    }}
                                    className={`flex items-center space-x-2 sm:space-x-4 px-3.5 sm:px-5 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 whitespace-nowrap shrink-0 ${tab.isDesktopOnly ? 'hidden md:flex' : ''} ${activeTab === tab.id
                                        ? 'bg-white/20 font-semibold shadow-inner text-white border border-white/20'
                                        : 'hover:bg-white/10 text-gray-200 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-90 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                                    </svg>
                                    <span className="text-xs sm:text-[15px]">{tab.label}</span>
                                </button>
                            ))}

                            {/* Direct Admin Dashboard link in Sidebar if user is admin */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center space-x-2 sm:space-x-4 px-3.5 sm:px-5 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 whitespace-nowrap bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40 mt-1 md:mt-3 shrink-0"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-90 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs sm:text-[15px]">Admin Dashboard</span>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-4 sm:p-8 md:p-14 bg-white">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-8 border-b border-gray-100 pb-3 sm:pb-6 capitalize flex items-center">
                            {activeTab === 'favorites' ? 'Favorite Places' : `${activeTab} Details`}
                        </h2>

                        {activeTab === 'profile' && (
                            <div className="space-y-6 sm:space-y-10 animate-fade-in">

                                {/* Profile Photo Section */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:space-x-8 text-center sm:text-left">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-inner overflow-hidden shrink-0 border-2 border-gray-100">
                                        {currentDisplayPhoto ? (
                                            <img src={currentDisplayPhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            displayUser.initials
                                        )}
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 sm:px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors shadow-md flex-1 sm:flex-none"
                                            >
                                                Upload New
                                            </button>
                                            <button
                                                onClick={handleRemovePhoto}
                                                className="px-4 sm:px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium rounded-xl transition-colors flex-1 sm:flex-none"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-gray-400">Recommended: Square JPG, PNG. Max 1MB.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-6">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 rounded-xl border border-gray-200/60 focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-sm text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 rounded-xl border border-gray-200/60 focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-sm text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={displayUser.email || user?.email || ""}
                                            readOnly
                                            disabled
                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-100 rounded-xl border border-gray-200/60 text-sm text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+855 12 345 678"
                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 rounded-xl border border-gray-200/60 focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-sm text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="Phnom Penh, Cambodia"
                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 rounded-xl border border-gray-200/60 focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-sm text-gray-800"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Bio</label>
                                        <textarea
                                            rows="4"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell us a little about your travel interests..."
                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 rounded-xl border border-gray-200/60 focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all resize-none text-sm text-gray-800"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end pt-4 sm:pt-6 border-t border-gray-100 items-center gap-3 sm:space-x-4">
                                    {saveSuccess && <span className="text-green-600 font-medium text-xs sm:text-sm text-center sm:text-left">Profile saved successfully!</span>}
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#28623a] to-[#1e4b2c] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#28623a]/30 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isSaving ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Profile Changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="animate-fade-in w-full">
                                <FavoritePlace />
                            </div>
                        )}

                        {activeTab !== 'profile' && activeTab !== 'favorites' && (
                            <div className="flex flex-col items-center justify-center h-80 text-gray-400 space-y-6">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">Coming Soon</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">The {activeTab} settings page is currently under construction and will be available in the next update.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
