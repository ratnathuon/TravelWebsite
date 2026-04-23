import React from 'react'
import { AboutUsCard } from '../components/AboutUsCard'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div>
      <h1 className='mt-10 text-center from-neutral-950 text-3xl '>Team Member</h1>
        <div className=' flex gap-x-3'>
          <AboutUsCard/>
          <AboutUsCard/>
          <AboutUsCard/>
          <AboutUsCard/>
        </div>
      <Footer/>
    </div>
    
  )
}
