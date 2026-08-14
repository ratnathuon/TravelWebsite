import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Mappin } from "../components/Mappin";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

export default function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "0px",
  });

  return (
    <motion.div
      id="discover-kingdom"
      ref={ref}
      initial={{ opacity: 0, y: -120 }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : -120,
      }}
      transition={{ duration: 1, ease: "linear" }}
      className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 my-8 sm:my-16 lg:my-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* LEFT: 3D Canvas */}
      <div className="w-full lg:w-1/2 h-[320px] sm:h-[420px] lg:h-[550px]">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 2.5]} />
          
          {/* Lighting - THIS IS CRUCIAL */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.4} />
          
          <Mappin scale={0.8} />
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={2}
            enableZoom={false}
          />
        </Canvas>
      </div>

      {/* RIGHT: Text */}
      <div className="w-full lg:w-1/2 max-w-xl font-poppins space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-6 lg:px-12 text-center lg:text-left">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold italic">
          Discover the Kingdom of Wonder
        </h3>
        <p className="text-base sm:text-lg lg:text-xl text-gray-700">
          From ancient temple complexes to pristine tropical islands, explore
          the diverse landscapes of Cambodia.
        </p>
        <p className="text-base sm:text-lg lg:text-xl text-gray-700">
          Cambodia is more than just a destination; it's a feeling. Whether
          you're chasing the sunrise at Angkor Wat or finding peace on the
          shores of Koh Rong, we help you find the hidden gems that other maps
          miss.
        </p>
      </div>
    </motion.div>
  );
}