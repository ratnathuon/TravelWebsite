import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import defaultSlides from "../data/Sliderdata";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 700;

export default function TravelSlider() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        let slideList = [];
        const querySnapshot = await getDocs(collection(db, "slides"));
        if (!querySnapshot.empty) {
          slideList = querySnapshot.docs.map((doc) => doc.data());
        }

        // Fetch destinations enabled for SlideHeader
        const destSnapshot = await getDocs(collection(db, "destinations"));
        if (!destSnapshot.empty) {
          const featuredDestSlides = destSnapshot.docs
            .map((doc) => doc.data())
            .filter((d) => d.showInSlideHeader)
            .map((d) => ({
              id: d.id,
              location: d.name.toUpperCase(),
              title: d.name,
              subTitle: d.location || "CAMBODIA",
              description: d.about || "Explore the kingdom of wonder.",
              bgImg: d.img,
              bgImgMobile: d.img,
              landscapeImg: d.img,
              portraitImg: d.img,
              portrait: d.img,
              photos: Array.isArray(d.gallery) && d.gallery.length >= 3 ? d.gallery : [d.img, d.img, d.img],
            }));

          if (featuredDestSlides.length > 0) {
            slideList = [...slideList, ...featuredDestSlides];
          }
        }

        if (slideList.length > 0) {
          setSlides(slideList);
        }
      } catch (err) {
        console.error("Error fetching slides from Firestore:", err);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / BASE_WIDTH);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const currentSlide = slides[current] || slides[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 40,
        damping: 25,
        delay: 0.3,
        duration: 1.2,
      }}
      ref={containerRef}
      className="relative w-full overflow-hidden mt-0 font-poppins"
      style={{ height: BASE_HEIGHT * scale }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');`}</style>

      {/* Scaled inner wrapper — exact ratio scaling from top left */}
      <div
        className="absolute top-0 left-0 mt-0"
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* Slides track */}
        <div
          className="flex h-full"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(current * 100) / slides.length}%)`,
            transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center h-full"
              style={{
                width: `${100 / slides.length}%`,
                flexShrink: 0,
                gap: 48,
                padding: "40px 100px 80px 100px",
              }}
            >
              {/* Left column */}
              <div
                className="flex flex-col items-start justify-start -top-50"
                style={{ flex: "0 0 260px" }}
              >
                <div
                  className="rounded-3xl overflow-hidden shadow-xl"
                  style={{ width: 250, height: 390 }}
                >
                  <img
                    src={slide.portrait}
                    alt={slide.location}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2
                  className="text-[#1e5e2e] mt-5 leading-none tracking-wide font-extrabold w-full text-center"
                  style={{ fontSize: 38 }}
                >
                  {slide.location}
                </h2>
                <p
                  className="text-[#555] mt-2.5 leading-relaxed text-sm"
                  style={{ maxWidth: 240 }}
                >
                  {slide.description}
                </p>
              </div>

              {/* Right column — overlapping photos */}
              <div
                className="relative flex-1"
                style={{ maxWidth: 650, height: 520 }}
              >
                {/* Top photo */}
                <div
                  className="absolute rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    width: 330,
                    height: 230,
                    top: -40,
                    left: 40,
                    zIndex: 3,
                  }}
                >
                  <img
                    src={slide.photos?.[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Back photo */}
                <div
                  className="absolute rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    width: 330,
                    height: 230,
                    top: 80,
                    right: 0,
                    zIndex: 2,
                  }}
                >
                  <img
                    src={slide.photos?.[1]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom photo */}
                <div
                  className="absolute rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    width: 330,
                    height: 230,
                    bottom: 50,
                    left: 40,
                    zIndex: 3,
                  }}
                >
                  <img
                    src={slide.photos?.[2]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300 border-none cursor-pointer p-0"
              style={{
                width: i === current ? 24 : 9,
                height: 9,
                background: i === current ? "#1e5e2e" : "#ccc",
              }}
            />
          ))}
        </div>

        {/* Explore button */}
        <div className="absolute bottom-32 -translate-x-1/2 z-20 mt-8 left-[67rem]">
          <button
            onClick={() =>
              navigate(
                `/explore/${encodeURIComponent(slides[current].location)}`
              )
            }
            className="rounded-full font-semibold bg-white border border-[#333] text-black px-4 py-1 text-[15px] cursor-pointer transition-all duration-200 hover:bg-[#1e5e2e] hover:text-white hover:border-[#1e5e2e] shadow-lg"
          >
            Explore
          </button>
        </div>
      </div>
    </motion.div>
  );
}