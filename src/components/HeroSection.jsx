import React from 'react'
import Mappin from '../assets/Mappin.png'
export default function HeroSection() {
  return (
    <div className=' flex text pl-40 pr-56 items-center gap-9 m-7'>
        <img src= {Mappin} alt="Mappin" />
        <div className=' font-poppins space-y-10'>
            <h3 className='text-4xl font-bold italic'>Discover the Kingdom of Wonder</h3>
            <p className='text-2xl'>From ancient temple complexes to pristine tropical islands, explore the diverse landscapes of Cambodia.</p>
            <p className='text-2xl'>Cambodia is more than just a destination; it's a feeling. Whether you're chasing the sunrise at Angkor Wat or finding peace on the shores of Koh Rong, we help you find the hidden gems that other maps miss.</p>
        </div>
    </div>
  )
}
