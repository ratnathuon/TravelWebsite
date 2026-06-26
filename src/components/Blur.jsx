import { motion } from "framer-motion";
 
const text = "Framer Motion";
 
export default function BlurIn() {
  const letters = text.split("");
 
  return (
    <div className="flex text-4xl font-medium">
      {letters.map((l, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
          className="inline-block whitespace-pre"
        >
          {l}
        </motion.span>
      ))}
    </div>
  );
}
 