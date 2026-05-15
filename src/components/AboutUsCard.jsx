import React from 'react'
import profile from '../assets/profile.jpg'
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";

export const AboutUsCard = () => {
  return (
    
<div className= "mt-10 transform scale-75 justify-items-center md:grid-cols-2 md:place-content-center font-poppins">
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
            <FaGithub className='w-7 h-7 text-black hover:text-blue-400'/>
        </button>
       <button className=' bg-white p-2 rounded-full'>
            <FaLinkedin className='w-7 h-7 text-black hover:text-blue-400'/>
       </button>
       
    </div>
</div>

</div>

  )
}
