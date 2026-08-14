import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import defaultMembers from "../data/memberdata";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const MemberCard = ({ name, position, image, facebook, github, linkedin, onHoverStart, onHoverEnd }) => (
  <motion.div
    onHoverStart={onHoverStart}
    onHoverEnd={onHoverEnd}
    whileHover={{ y: -8, scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="flex-shrink-0 w-72 bg-[#CBCBCB] p-6 border border-default rounded-3xl shadow-xs cursor-pointer"
    style={{ flexShrink: 0 }}
  >
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <img className="rounded-md w-full h-48 object-cover" src={image} alt={name} />
    </motion.div>

    <h5 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading">{name}</h5>
    <p className="mb-6 text-body">Position: {position}</p>

    <div className="flex justify-between pr-6 pl-6 items-center">
      {[
        { href: facebook, Icon: FaFacebook, label: "Facebook" },
        { href: github, Icon: FaGithub, label: "GitHub" },
        { href: linkedin, Icon: FaLinkedin, label: "LinkedIn" },
      ].map(({ href, Icon, label }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <button className="bg-white p-2 rounded-full">
            <Icon className="w-7 h-7 text-black hover:text-blue-400 transition-colors" />
          </button>
        </motion.a>
      ))}
    </div>
  </motion.div>
);

export const AboutUsCard = () => {
  const [memberList, setMemberList] = useState(defaultMembers);
  const controls = useAnimationControls();
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const positionRef = useRef(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "team_members"));
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMemberList(data);
        }
      } catch (err) {
        console.error("Error fetching team members from Firestore:", err);
      }
    };
    fetchMembers();
  }, []);

  // Duplicate for seamless loop
  const allMembers = [...memberList, ...memberList];

  // Card width + gap
  const CARD_WIDTH = 256 + 24; // w-64 (256px) + gap-6 (24px)
  const TOTAL_WIDTH = CARD_WIDTH * memberList.length;
  const SCROLL_SPEED = 50; // px per second

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp - positionRef.current * (1000 / SCROLL_SPEED);

      if (!isPaused) {
        const elapsed = timestamp - startTimeRef.current;
        positionRef.current = (elapsed * SCROLL_SPEED) / 600;

        // Loop: reset when we've scrolled one full set
        if (TOTAL_WIDTH > 0 && positionRef.current >= TOTAL_WIDTH) {
          positionRef.current = positionRef.current - TOTAL_WIDTH;
          startTimeRef.current = timestamp - positionRef.current * (1000 / SCROLL_SPEED);
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${positionRef.current}px)`;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, TOTAL_WIDTH]);

  const handleHoverStart = () => {
    setIsPaused(true);
  };

  const handleHoverEnd = () => {
    setIsPaused(false);
  };

  return (
    <div className="mt-10 mb-10 font-poppins overflow-hidden w-full ">
      {/* Fade edges */}
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-6 sm:w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.8), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-6 sm:w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, rgba(255,255,255,0.8), transparent)" }}
        />

        {/* Scrolling track */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-6 py-4"
            style={{ width: "max-content", willChange: "transform" }}
          >
            {allMembers.map((member, index) => (
              <MemberCard
                key={`${member.id || member.name}-${index}`}
                {...member}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutUsCard;