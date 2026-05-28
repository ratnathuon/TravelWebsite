import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ─── localStorage helpers ───────────────────────────────────────────────────
const STORAGE_KEY = 'travel_cambodia_user';
const DB_KEY = "travel_cambodia_users_db";

function getUsersDb() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || {};
  } catch {
    return {};
  }
}

export function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (user && user.email) {
      const db = getUsersDb();
      db[user.email] = user;
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
  } catch {}
}

export function clearUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function enrichUserFromDb(userData) {
  if (!userData || !userData.email) return userData;
  const db = getUsersDb();
  const savedData = db[userData.email];
  if (!savedData) return userData;
  return {
    ...savedData,
    ...userData,
    photoURL: userData.photoURL || savedData.photoURL,
  };
}
// ───────────────────────────────────────────────────────────────────────────

export default function Header({ user, onOpenAccount, onSignOut }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const userDropdownRef = useRef(null);
  const navDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        navDropdownRef.current &&
        !navDropdownRef.current.contains(e.target)
      ) {
        setNavDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ handleSignOut: clears user from state and localStorage
  const handleSignOut = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      clearUser();
      if (onSignOut) onSignOut();
      setIsSigningOut(false);
      setUserDropdownOpen(false);

      // Also log out of Firebase if used
      import("firebase/auth").then(({ getAuth, signOut }) => {
        const auth = getAuth();
        signOut(auth).catch(() => console.log("Firebase signout error"));
      });

      navigate("/");
    }, 1500);
  };

  const navLinkClass = (path) =>
    `block py-2 px-3 rounded-sm md:p-0 transition-colors duration-200 ${
      location.pathname === path
        ? "text-blue-400 underline md:text-blue-400"
        : "text-white hover:bg-blue-600 md:hover:bg-transparent md:hover:underline"
    }`;

  return (
    <>
      <nav className="bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a]">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyUwFbJZraL5nOMSB7uJrRe52nmS2NBafiGA&s"
              className="h-8"
              alt="Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
              Travel Cambodia
            </span>
          </Link>

          <div className="flex items-center md:order-2 space-x-3 relative">
            {!user ? (
              // ✅ opens the Account modal
              <button
                onClick={onOpenAccount}
                className="text-white bg-[#3a6b53] hover:bg-[#2f5341] px-4 py-2 rounded-full font-medium transition-colors"
              >
                Sign Up
              </button>
            ) : (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 focus:ring-4 focus:ring-gray-300 rounded-full transition-all"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E5DFFF] text-[#3D1A6A] font-bold text-sm overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.initials
                    )}
                  </div>
                  <span className="text-white font-medium hidden md:block text-sm mr-2">
                    {user.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 z-50 text-base list-none bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a] divide-y divide-gray-600 rounded-lg shadow-lg w-50">
                    <div className="px-4 py-3">
                      <span className="block text-sm text-white font-bold">
                        {user.name}
                      </span>
                      <span className="block text-sm text-gray-300 truncate">
                        {user.email}
                      </span>
                    </div>
                    <ul className="py-2">
                      <li>
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-sm text-gray-200 hover:underline hover:bg-blue-600 rounded"
                        >
                          Account information
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account?tab=favorites"
                          className="block px-4 py-2 text-sm text-gray-200 hover:underline hover:bg-blue-600 rounded"
                        >
                          Favorite places
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:underline hover:bg-blue-600 rounded flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSigningOut ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Signing out...
                            </>
                          ) : (
                            "Sign out"
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-300 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <div
            className={`${mobileMenuOpen ? "flex" : "hidden"} items-center justify-between w-full md:flex md:w-auto md:order-1`}
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-700 rounded-lg md:space-x-16 md:flex-row md:mt-0 md:border-0">
              <li>
                <Link to="/" className={navLinkClass("/")}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={navLinkClass("/about")}>
                  About
                </Link>
              </li>

              <li ref={navDropdownRef} className="relative">
                <button
                  onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                  className={`flex items-center justify-between w-full py-2 px-3 rounded font-medium md:w-auto md:p-0 transition-colors duration-200 ${
                    navDropdownOpen
                      ? "text-blue-400 underline"
                      : "text-white hover:bg-blue-600 md:hover:bg-transparent md:hover:underline"
                  }`}
                >
                  Destinations
                  <svg
                    className="w-4 h-4 ms-1.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 9-7 7-7-7"
                    />
                  </svg>
                </button>

                {navDropdownOpen && (
                  <div className="absolute left-0 mt-2 z-10 rounded-lg shadow-lg w-52 bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a] border border-gray-600">
                    <ul className="p-2 text-sm font-medium">
                      <li>
                        <Link
                          to="#"
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          All Category
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          The Plains Region
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          Tonle Sap Lake Area
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          Coastal Region
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          Mountain and Plateau Region
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

    </>
  );
}