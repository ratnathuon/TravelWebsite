import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaFacebookMessenger, FaGithub, FaTelegram } from 'react-icons/fa'
export default function Footer() {
  return (
<footer className="bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a] font-poppins">
    <div className="text-white mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between text-center">
          <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center justify-center md:justify-start">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyUwFbJZraL5nOMSB7uJrRe52nmS2NBafiGA&s" className="h-7 me-3" alt="Logo" />
                  <span className="text-heading self-center text-2xl font-semibold whitespace-nowrap">Travel Cambodia</span>
              </Link>
          </div>
          <div className="grid grid-cols-1 justify-center gap-8 sm:gap-6 sm:grid-cols-3">
              <div>
                  <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Navigation</h2>
                  <ul className="text-body font-medium">
                      <li className="mb-4">
                          <Link to="/about" className="hover:underline">About Us</Link>
                      </li>
                      <li>
                          <Link to="/#explore-section" className="hover:underline">Explore Regions</Link>
                      </li>
                  </ul>
              </div>
              <div>
                  <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Follow us</h2>
                  <ul className="text-body font-medium">
                      <li className="mb-4">
                          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Github</a>
                      </li>
                      <li>
                          <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="hover:underline">Telegram</a>
                      </li>
                  </ul>
              </div>
              <div className='flex flex-col items-center justify-center'>
                  <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Collaborate</h2>
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIKPTzMBB1U6xopP1fHeVJGh0ZVx3OnD0IlA&s" alt="ite_logo" className='w-20 h-20 justify-center' />
              </div>
          </div>
      </div>
      <hr className="my-6 border-default sm:mx-auto lg:my-8" />
      <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-body sm:text-center">© 2026 <Link to="/" className="hover:underline">TravelCambodia™</Link>. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a href="#" className="text-body hover:scale-110 transition-transform duration-200 ms-5">   
                <FaFacebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-body hover:scale-110 transition-transform duration-200 ms-5">
                <FaFacebookMessenger className="w-5 h-5" />
            </a>
            <a href="#" className="text-body hover:scale-110 transition-transform duration-200 ms-5">
                <FaTelegram className="w-5 h-5" />
            </a>
            <a href="#" className="text-body hover:scale-110 transition-transform duration-200 ms-5">
                <FaGithub className="w-5 h-5" />     
            </a>
          </div>
      </div>
    </div>
</footer>

  )
}
