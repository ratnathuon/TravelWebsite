import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clearUser } from './Header';
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

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
    const [previewPhotoURL, setPreviewPhotoURL] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);

    const currentDisplayPhoto = removePhoto ? null : (previewPhotoURL || displayUser.photoURL);

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
        const { firstName, lastName } = getNames(displayUser.name);
        setFormData({
            firstName,
            lastName,
            phone: displayUser.phone || '',
            location: displayUser.location || '',
            bio: displayUser.bio || ''
        });
    }, [user]);

    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = () => {
        if (!user) {
            alert("Please sign up or log in to save your profile changes permanently!");
            return;
        }
        setIsSaving(true);
        setSaveSuccess(false);

        let finalPhotoURL = displayUser.photoURL;

        if (removePhoto) {
            finalPhotoURL = null;
            if (auth.currentUser) updateProfile(auth.currentUser, { photoURL: null }).catch(()=>{});
        } else if (pendingPhotoFile && previewPhotoURL) {
            // Save the image directly to the browser's local storage (100% Free)
            finalPhotoURL = previewPhotoURL;
        }

        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

        // We can still safely update the name in Firebase Auth (100% Free)
        if (auth.currentUser) {
            updateProfile(auth.currentUser, { displayName: fullName }).catch(()=>{});
        }

        setTimeout(() => {
            if (onUpdateUser) {
                onUpdateUser({ 
                    ...displayUser, 
                    name: fullName, 
                    phone: formData.phone,
                    location: formData.location,
                    bio: formData.bio,
                    photoURL: finalPhotoURL 
                });
            }

            setPendingPhotoFile(null);
            setRemovePhoto(false);

            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1500);
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
        // Also log out of Firebase if used
        import("firebase/auth").then(({ getAuth, signOut }) => {
            const auth = getAuth();
            signOut(auth).catch(() => console.log("Firebase signout error"));
        });
        clearUser();
        if (onSignOut) {
            onSignOut();
        }
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pt-10 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your profile, security, and preferences.</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-gray-100">

                    {/* Sidebar */}
                    <div className="w-full md:w-80 bg-gradient-to-br from-[#0F2027] via-[#204E2E] to-[#28623a] text-white p-8">
                        <div className="flex items-center space-x-5 mb-12">
                            <div className="flex-shrink-0 w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/20 shadow-lg overflow-hidden">
                                {currentDisplayPhoto ? (
                                    <img src={currentDisplayPhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    displayUser.initials
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-xl truncate">{displayUser.name}</h3>
                                <p className="text-sm text-gray-300 truncate opacity-80">{displayUser.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {[
                                { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                { id: 'favorites', label: 'Favorite places', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                                { id: 'signout', label: 'Sign out', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' }
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
                                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-white/15 font-semibold shadow-inner text-white'
                                        : 'hover:bg-white/5 text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                                    </svg>
                                    <span className="text-[15px]">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-8 md:p-14 bg-white">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-6 capitalize flex items-center">
                            {activeTab === 'favorites' ? 'Favorite Places' : `${activeTab} Details`}
                        </h2>

                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-fade-in">

                                {/* Profile Photo Section */}
                                <div className="flex items-center space-x-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner overflow-hidden">
                                        {currentDisplayPhoto ? (
                                            <img src={currentDisplayPhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            displayUser.initials
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex space-x-3 mb-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors shadow-md"
                                            >
                                                Upload New
                                            </button>
                                            <button
                                                onClick={handleRemovePhoto}
                                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400">Recommended: Square JPG, PNG. Max 1MB.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue={user.email}
                                            disabled
                                            className="w-full px-5 py-3.5 bg-gray-100 rounded-xl border-transparent text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+855 12 345 678"
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="Phnom Penh, Cambodia"
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-gray-800"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            rows="4"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell us a little about your travel interests..."
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all resize-none text-gray-800"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-100 items-center space-x-4">
                                    {saveSuccess && <span className="text-green-600 font-medium">Profile saved successfully!</span>}
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#28623a] to-[#1e4b2c] text-white font-medium rounded-xl shadow-lg shadow-[#28623a]/30 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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
