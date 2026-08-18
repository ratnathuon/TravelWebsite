import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import defaultMembers from "../data/memberdata";
import { subscribeToTeamMembers } from "../data/adminData";

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
      <img
        className="rounded-md w-full h-48 object-cover"
        src={image || "/assets/Profile/Ratna.jpg"}
        alt={name}
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop";
        }}
      />
    </motion.div>

    <h5 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading truncate">{name}</h5>
    <p className="mb-6 text-body truncate">Position: {position}</p>

    <div className="flex justify-between pr-6 pl-6 items-center">
      {[
        { href: facebook, Icon: FaFacebook, label: "Facebook" },
        { href: github, Icon: FaGithub, label: "GitHub" },
        { href: linkedin, Icon: FaLinkedin, label: "LinkedIn" },
      ].map(({ href, Icon, label }) => (
        <motion.a
          key={label}
          href={href || "#"}
          target={href && href !== "#" ? "_blank" : "_self"}
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <button className="bg-white p-2 rounded-full shadow-xs hover:bg-gray-100 transition-colors">
            <Icon className="w-6 h-6 text-black hover:text-blue-500 transition-colors" />
          </button>
        </motion.a>
      ))}
    </div>
  </motion.div>
);

export const AboutUsCard = () => {
  const [memberList, setMemberList] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("travel_team_members") || "null");
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch {}
    return defaultMembers;
  });

  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const positionRef = useRef(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToTeamMembers((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setMemberList(list);
      } else if (Array.isArray(list) && list.length === 0) {
        setMemberList([]);
      }
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // Duplicate for seamless infinite loop (at least 2 sets)
  const allMembers = memberList.length > 0 
    ? (memberList.length < 4 ? [...memberList, ...memberList, ...memberList, ...memberList] : [...memberList, ...memberList])
    : [];

  // Card width + gap
  const CARD_WIDTH = 288 + 24; // w-72 (288px) + gap-6 (24px)
  const TOTAL_WIDTH = CARD_WIDTH * (memberList.length || 1);
  const SCROLL_SPEED = 50; // px per second

  useEffect(() => {
    if (memberList.length === 0) return;

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
  }, [isPaused, TOTAL_WIDTH, memberList.length]);

  const handleHoverStart = () => {
    setIsPaused(true);
  };

  const handleHoverEnd = () => {
    setIsPaused(false);
  };

  if (memberList.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 w-full font-poppins">
        <p className="text-base italic">No team members currently listed.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-10 font-poppins overflow-hidden w-full">
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