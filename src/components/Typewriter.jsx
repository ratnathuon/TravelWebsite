import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const text = "Team Member";

export default function Typewriter() {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const speed = isDeleting ? 40 : 80;

    const t = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed((prev) => text.slice(0, prev.length + 1));
        if (displayed.length + 1 === text.length) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        setDisplayed((prev) => prev.slice(0, -1));
        if (displayed.length - 1 === 0) {
          setTimeout(() => setIsDeleting(false), 500);
        }
      }
    }, speed);

    return () => clearTimeout(t);
  }, [displayed, isDeleting]);

  return (
    <div className="font-poppins font-bold mt-10 text-center text-green-900 text-5xl">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[3px] h-10 bg-blue-500 ml-1 rounded-sm"
      />
    </div>
  );
}