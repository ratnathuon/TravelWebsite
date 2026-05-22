import React from 'react'
import profile from '../assets/profile.jpg'
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";

export const AboutUsCard = () => {
  return (

    <div className="mt-10 transform scale-75 justify-items-center md:grid-cols-2 md:place-content-center font-poppins">
      <div className="bg-[#CBCBCB] block max-w-sm p-6 border border-default rounded-3xl shadow-xs">
        <a href="#">
          <img className="rounded-md" src={profile} alt="" />
        </a>
        <a href="#">
          <h5 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading">Thuon Ratna</h5>
        </a>
        <p className="mb-6 text-body">Positon: Leader</p>
        <div className="flex justify-between pr-10 pl-10 items-center">
          <button className=' bg-white p-2 rounded-full '>
            <FaFacebook className="w-7 h-7 text-black hover:text-blue-400" />
          </button>
          <button className=' bg-white p-2 rounded-full'>
            <FaGithub className='w-7 h-7 text-black hover:text-blue-400' />
          </button>
          <button className=' bg-white p-2 rounded-full'>
            <FaLinkedin className='w-7 h-7 text-black hover:text-blue-400' />
          </button>

        </div>
      </div>
>>>>>>> ca6ffe55f1cf24cbd07bd15d264671b928b241e3

      <div className="mt-10 transform scale-75 justify-items-center md:grid-cols-2 md:place-content-center">
        <div className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-md shadow-xs">
          <a href="#">
            <img className="rounded-md" src={profile} alt="" />
          </a>
          <a href="#">
            <h5 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading">Thuon Ratna</h5>
          </a>
          <p className="mb-6 text-body">Positon: Leader</p>
          <a href="#" className="inline-flex items-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Read more
            <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" /></svg>
          </a>
        </div>

      </div>

      )
}
