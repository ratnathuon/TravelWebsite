import React, { useState } from 'react';

export default function AccountInfo({ user }) {
    const [activeTab, setActiveTab] = useState('profile');

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white shadow-xl rounded-3xl max-w-md w-full border border-gray-100">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">Access Denied</h2>
                    <p className="text-gray-500 mb-6">Please sign in to view your account information and preferences.</p>
                </div>
            </div>
        );
    }

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
                            <div className="flex-shrink-0 w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/20 shadow-lg">
                                {user.initials}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-xl truncate">{user.name}</h3>
                                <p className="text-sm text-gray-300 truncate opacity-80">{user.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {[
                                { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                { id: 'security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                                { id: 'preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                                { id: 'billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 capitalize ${activeTab === tab.id
                                            ? 'bg-white/15 font-semibold shadow-inner text-white'
                                            : 'hover:bg-white/5 text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                                    </svg>
                                    <span className="text-[15px]">{tab.id}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-8 md:p-14 bg-white">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-6 capitalize flex items-center">
                            {activeTab} Details
                        </h2>

                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-fade-in">

                                {/* Profile Photo Section */}
                                <div className="flex items-center space-x-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner">
                                        {user.initials}
                                    </div>
                                    <div>
                                        <div className="flex space-x-3 mb-2">
                                            <button className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors shadow-md">
                                                Upload New
                                            </button>
                                            <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                                                Remove
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400">Recommended: Square JPG, PNG. Max 1MB.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue={user.name}
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
                                            placeholder="+855 12 345 678"
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            placeholder="Phnom Penh, Cambodia"
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all text-gray-800"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Tell us a little about your travel interests..."
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[#28623a] focus:ring-2 focus:ring-[#28623a]/20 outline-none transition-all resize-none text-gray-800"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-100">
                                    <button className="px-8 py-3.5 bg-gradient-to-r from-[#28623a] to-[#1e4b2c] text-white font-medium rounded-xl shadow-lg shadow-[#28623a]/30 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl">
                                        Save Profile Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'profile' && (
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
