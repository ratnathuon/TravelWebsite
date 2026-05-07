import React from 'react'
import Search from '../components/Search'
import Footer from '../components/Footer'
import Destinations from '../components/Destinations'
import SliderHeader from '../components/SlideHeader'

export default function Home() {
  return (
    <div>
      <Search />
      <SliderHeader/>
      <Destinations />
      <Footer />
    </div>
  )
}
