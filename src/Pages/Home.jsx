import React from 'react'
import Search from '../components/Search'
import Footer from '../components/Footer'
import Destinations from '../components/Destinations'
import SliderHeader from '../components/SlideHeader'
import Category from '../components/Category'
import HeroSection from '../components/HeroSection'
import TopPlace from '../components/TopPlace'
import Question from '../components/Question'
export default function Home() {
  return (
    <div>
      <Search />

      <SliderHeader/>
      <h1 className='text-center font-bold text-5xl m-8 text-green-900 font-poppins italic'>Top Destinations</h1>
      {/* <Destinations /> */}
      <TopPlace/>
      <HeroSection/>
      <h1 className='text-center font-bold text-5xl m-8 text-green-900 font-poppins italic'>Top Explore in Cambodia</h1>
      <Category/>
      <Question/>
      <Footer />
    </div>
  )
}
