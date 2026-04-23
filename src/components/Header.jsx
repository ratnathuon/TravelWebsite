import React, {useState, useRef, useEffect} from 'react'
import profile from '../assets/profile.jpg'
import { Link } from 'react-router-dom'
export default function Header() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [navDropdownOpen, setNavDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userDropdownRef = useRef(null)
  const navDropdownRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false)
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
        setNavDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div>
      <nav className="bg-white border-gray-200 bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a]">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">

          {/* Logo */}
          <Link to ="/" className="flex items-center space-x-2 ">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyUwFbJZraL5nOMSB7uJrRe52nmS2NBafiGA&s" className="h-8" alt="Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Travel Cambodia</span>
          </Link>

          <div className="flex items-center md:order-2 space-x-3 relative">

            {/* Profile Button */}
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open user menu</span>
                <img className="w-8 h-8 rounded-full" src={profile} alt="user photo" />
              </button>

              {/* Profile Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 z-50 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 w-48">
                  <div className="px-4 py-3">
                    <span className="block text-sm text-gray-900 dark:text-white">Bonnie Green</span>
                    <span className="block text-sm text-gray-500 truncate dark:text-gray-400">name@flowbite.com</span>
                  </div>
                  <ul className="py-2">
                    <li><Link to ="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200">Account information</Link></li>
                    <li><Link to ="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200">Favorite places</Link></li>
                    <li><Link to ="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200">Sign out</Link></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg  md:space-x-16 md:flex-row md:mt-0 md:border-0 ]">
              <li>
                <Link to ="/" className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0">Home</Link>
              </li>
              <li>
                <Link to ="/about" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white">About</Link>
              </li>

              {/* Nav Dropdown */}
              <li ref={navDropdownRef} className="relative">
                <button
                  onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                  className="flex items-center justify-between w-full py-2 px-3 rounded font-medium text-gray-900 md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white"
                >
                  Destinations
                  <svg className="w-4 h-4 ms-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                  </svg>
                </button>

                {navDropdownOpen && (
                  <div className="absolute left-0 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-44 dark:bg-gray-700">
                    <ul className="p-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
                      <li><Link to ="#" className="inline-flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">All Category</Link></li>
                      <li><Link to ="#" className="inline-flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">The Plains Region</Link></li>
                      <li><Link to ="#" className="inline-flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">Tonle Sap Lake Area</Link></li>
                      <li><Link to ="#" className="inline-flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">Coastal Region</Link></li>
                      <li><Link to ="#" className="inline-flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">Mountain and Plateau Region</Link></li>
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </div>

        </div>
      </nav>
    </div>
  )
}