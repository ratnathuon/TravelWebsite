import React from 'react'
import { AboutUsCard } from '../components/AboutUsCard'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div>
      <h1 className='font-poppins font-bold mt-10 text-center text-green-900 text-5xl '>Team Member</h1>
      <p className=' text-center mt-10 italic text-2xl'>We’re Student of RUPP</p>
        <div className='pl-44 pr-44 justify-between flex mt-0'>
          <AboutUsCard/>
          <AboutUsCard/>
          <AboutUsCard/>
          <AboutUsCard/>
        </div>
      <p className=' mb-10 font-poppins text-white p-80 pt-16 pb-16 text-center text-lg bg-gradient-to-r from-[#0F2027] via-[#28623a] to-[#28623a]  '>Powered by a team of IT Engineering students at RUPP, Travel Cambodia is a digital initiative dedicated to showcasing the beauty of our home. We combine engineering precision with local insight to help you navigate the Kingdom of Wonder effortlessly.</p>
      <Footer/>
    </div>
    
  )
}
