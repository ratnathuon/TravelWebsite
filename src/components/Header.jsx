import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { DEFAULT_SYSTEM_ADMINS, fetchSystemAdminsFromDb, isEmailAdmin } from "../data/adminData";

// ─── localStorage helpers ───────────────────────────────────────────────────
const STORAGE_KEY = "travel_cambodia_user";
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

export function checkIsAdmin(user) {
  if (!user || !user.email) return false;
  if (user.role === "admin" || user.isAdmin === true) return true;
  return isEmailAdmin(user.email);
}

export default function Header({ user, onOpenAccount, onSignOut }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => checkIsAdmin(user));

  const location = useLocation();
  const navigate = useNavigate();
  const userDropdownRef = useRef(null);
  const navDropdownRef = useRef(null);

  useEffect(() => {
    // Check initially
    setIsAdmin(checkIsAdmin(user));

    // Listen to admin list updates from Firestore
    const handleAdminsUpdate = () => {
      setIsAdmin(checkIsAdmin(user));
    };
    window.addEventListener("adminsUpdated", handleAdminsUpdate);

    // If user is logged in, verify against Firestore to guarantee latest permissions
    if (user?.email) {
      fetchSystemAdminsFromDb().then((admins) => {
        const clean = user.email.toLowerCase().trim();
        if (admins.some((a) => (a || "").toLowerCase().trim() === clean)) {
          setIsAdmin(true);
        }
      });
    }

    return () => {
      window.removeEventListener("adminsUpdated", handleAdminsUpdate);
    };
  }, [user]);

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

  const handleDestinationSelect = (categoryValue) => {
    setNavDropdownOpen(false);
    setMobileMenuOpen(false);

    window.dispatchEvent(
      new CustomEvent("selectCategory", { detail: categoryValue })
    );

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const navLinkClass = (path) =>
    `block py-2 px-3 rounded-sm md:p-0 transition-colors duration-200 ${
      location.pathname === path
        ? "text-blue-400 underline md:text-blue-400"
        : "text-white hover:bg-blue-600 md:hover:bg-transparent md:hover:underline"
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a] shadow-md font-poppins">
        <div className="max-w-screen-xl mx-auto flex flex-nowrap items-center justify-between px-3 sm:px-5 py-3 sm:py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
              delay: 0.2,
              duration: 1.2,
            }}
            className="flex-shrink-0"
          >
            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyUwFbJZraL5nOMSB7uJrRe52nmS2NBafiGA&s"
                className="h-6 sm:h-8"
                alt="Logo"
              />
              <span className="self-center text-lg sm:text-2xl font-semibold whitespace-nowrap text-white">
                Travel Cambodia
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
              delay: 0.2,
              duration: 1.2,
            }}
            className="flex items-center md:order-2 space-x-1.5 sm:space-x-3 relative shrink-0"
          >
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
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E5DFFF] text-[#3D1A6A] font-bold text-xs sm:text-sm overflow-hidden">
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
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: userDropdownOpen ? 1 : 0,
                      height: userDropdownOpen ? "auto" : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 mt-2 z-50 text-base list-none bg-gradient-to-r from-[#0F2027]/85 via-[#28623a]/85 to-[#28623a]/85 backdrop-blur-md border border-white/20 divide-y divide-gray-600 rounded-lg shadow-lg w-50"
                  >
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
                          className="block px-4 py-2 text-sm text-gray-200  hover:bg-blue-600 rounded"
                        >
                          Account information
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account?tab=favorites"
                          className="block px-4 py-2 text-sm text-gray-200  hover:bg-blue-600 rounded"
                        >
                          Favorite places
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-700/80 hover:text-white rounded transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              Admin Dashboard
                            </span>
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-200  hover:bg-blue-600 rounded flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
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
                  </motion.div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 justify-center text-sm text-gray-300 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 "
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
          </motion.div>

          {/* Nav Links */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
              delay: 0.1,
              duration: 0.4,
            }}
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } absolute top-full left-0 right-0 w-full p-4 shadow-2xl md:static md:w-auto md:bg-transparent md:border-0 md:p-0 md:shadow-none md:flex md:items-center md:order-1 ${mobileMenuOpen ? "bg-gradient-to-r from-[#0F2027]/85 via-[#28623a]/85 to-[#28623a]/85" : ""}`}
          >
            <ul className="flex flex-col font-medium w-full md:w-auto space-y-2 md:space-y-0 md:space-x-6 lg:space-x-12 md:flex-row ">
              <li>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass("/")}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass("/about")}
                >
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
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: navDropdownOpen ? 1 : 0,
                      height: navDropdownOpen ? "auto" : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`absolute left-0 mt-2 z-[100] rounded-lg shadow-lg w-52 ${mobileMenuOpen ? "bg-gradient-to-r from-[#0F2027]/85 via-[#28623a]/85 to-[#28623a]/85 backdrop-blur-md border border-white/20" : "bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a]"}`}
                  >
                    <ul className="p-2 text-sm font-medium">
                      <li>
                        <Link
                          to="/#all"
                          onClick={() => handleDestinationSelect("all")}
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          All Category
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#plains"
                          onClick={() => handleDestinationSelect("plains")}
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          The Plains Region
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#tonle"
                          onClick={() => handleDestinationSelect("tonle")}
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          Tonle Sap Lake Area
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#coastal"
                          onClick={() => handleDestinationSelect("coastal")}
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          Coastal Region
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#mountain"
                          onClick={() => handleDestinationSelect("mountain")}
                          className="inline-flex items-center w-full p-2 text-gray-200 hover:bg-blue-600 hover:text-white rounded"
                        >
                          Mountain and Plateau Region
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </li>
            </ul>
          </motion.div>
        </div>
      </nav>
    </>
  );
}
