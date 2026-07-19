import React from 'react'
import CardPlace from './CardPlace'
import waterfall from '../assets/PicPlace/Veal Pouch Waterfall, Kompot.jpeg'
import kho_han from '../assets/PicPlace/Koh Han.jpeg'
import angkor from '../assets/PicPlace/siemreap/Angkor Wat .jpg'
const places = [
  { image: waterfall, name: 'Veal Pouch Waterfall', location: 'Kompot, Cambodia', rating: 5 },
  { image: kho_han, name: 'Veal Pouch Waterfall', location: 'Kompot, Cambodia', rating: 4 },
  { image: angkor, name: 'Veal Pouch Waterfall', location: 'Kompot, Cambodia', rating: 3 },
]
function Destinations() {
  return (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 ml-56 mr-56">
      {places.map((place, i) => (
        <CardPlace key={i} {...place} />
      ))}
    </div>
  )
}
export default Destinations
