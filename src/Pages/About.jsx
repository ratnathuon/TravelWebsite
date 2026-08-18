import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { AboutUsCard } from '../components/AboutUsCard';
import Footer from '../components/Footer';
import Typewriter from '../components/Typewriter';
import { SiGooglemaps, SiPixabay } from 'react-icons/si';
import { MdTravelExplore } from 'react-icons/md';
import { DEFAULT_ABOUT_INFO, subscribeToAboutInfo } from '../data/adminData';

export default function About() {
  const [aboutInfo, setAboutInfo] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("travel_about_info") || "null");
      if (cached) return cached;
    } catch {}
    return DEFAULT_ABOUT_INFO;
  });

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const unsub = subscribeToAboutInfo((data) => {
      if (data) {
        setAboutInfo(data);
      }
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const rawKeywords = aboutInfo?.headerKeywords;
  const words = Array.isArray(rawKeywords) && rawKeywords.length > 0
    ? rawKeywords.map((w) => String(w).trim()).filter(Boolean)
    : (typeof rawKeywords === "string" ? rawKeywords.split(",").map(w => w.trim()).filter(Boolean) : DEFAULT_ABOUT_INFO.headerKeywords);

  const activeWords = words.length > 0 ? words : DEFAULT_ABOUT_INFO.headerKeywords;

  useEffect(() => {
    if (activeWords.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeWords.length]);

  const currentWord = activeWords[index % activeWords.length] || activeWords[0] || "";

  return (
    <div className="font-poppins text-gray-800">
      <Typewriter />
      
      <div className='text-center mt-5 mb-8'>
        <span className='mt-10 italic text-2xl'>{aboutInfo.headerPrefix || "We’re Students"} </span>
        <AnimatePresence mode="wait">
          <motion.span className='mt-10 italic text-2xl font-semibold text-green-800'
            key={currentWord}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className='px-2 sm:px-8 md:px-20 lg:px-44 justify-between flex mt-0'>
        <AboutUsCard />
      </motion.div>

      {/* About Description */}
      <p className='max-w-4xl mx-auto text-black px-6 py-8 text-center text-lg leading-relaxed whitespace-pre-line'>
        {aboutInfo.description || DEFAULT_ABOUT_INFO.description}
      </p>

      {/* Sources & Logos Section */}
      <div className='max-w-4xl mx-auto px-6 my-10 py-8 text-center'>
        <h3 className='text-2xl font-bold text-gray-900 mb-6'>
          {aboutInfo.sourcesTitle || "Source of Content & Media"}
        </h3>

        {/* Source Logos */}
        <div className='flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-8'>
          
          {/* Google Maps Logo */}
          <a 
            href="https://maps.google.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-red-400 transition-all cursor-pointer group"
          >
            <SiGooglemaps className="w-8 h-8 text-[#EA4335] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Maps & Data</span>
              <span className="text-sm font-bold text-gray-800">Google Maps</span>
            </div>
          </a>

          {/* Pixabay Logo */}
          <a 
            href="https://pixabay.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500 transition-all cursor-pointer group"
          >
            <SiPixabay className="w-8 h-8 text-[#02B875] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Free Images</span>
              <span className="text-sm font-bold text-gray-800">Pixabay</span>
            </div>
          </a>

          {/* Tourism Cambodia */}
          <a 
            href="https://tourism.gov.kh/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-600 transition-all cursor-pointer group"
          >
            <MdTravelExplore className="w-8 h-8 text-[#1e5e2e] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Cultural Info</span>
              <span className="text-sm font-bold text-gray-800">Cambodia Tourism</span>
            </div>
          </a>

        </div>

        {/* Learning Disclaimer */}
        <p className='text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed italic whitespace-pre-line'>
          {aboutInfo.disclaimer || DEFAULT_ABOUT_INFO.disclaimer}
        </p>
      </div>

      <Footer />
    </div>
  )
}

