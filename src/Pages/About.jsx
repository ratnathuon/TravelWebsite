import React from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AboutUsCard } from '../components/AboutUsCard'
import Footer from '../components/Footer'
import Typewriter from '../components/Typewriter'
export default function About() {
  const words = ["of RUPP", "ITE", "Engineering"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return ( 
    <div>
      <Typewriter/>
      <div className='text-center mt-5'>
      <span className='mt-10 italic text-2xl'>We’re Student's </span>
      <AnimatePresence mode="wait">
        <motion.span className=' mt-10 italic text-2xl'
          key={words[index]}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => {
            setTimeout(() => setPhase("split"), 600);
          }}
          className='pl-44 pr-44 justify-between flex mt-0'>
          <AboutUsCard/>
        </motion.div>
        <text/>
      <p className=' mb-10 font-poppins text-black p-80 pt-16 pb-16 text-center text-lg bg-gradient-to-r '>
        Powered by a team of IT Engineering students at RUPP, Travel Cambodia is a digital initiative dedicated to showcasing the beauty of our home. We combine engineering precision with local insight to help you navigate the Kingdom of Wonder effortlessly.
        </p>
      <Footer/>
    </div>
    
  )
}
