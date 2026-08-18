import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    title: "What destinations can I explore in Cambodia?",
    description:
      "Users can explore popular tourist destinations and attractions across Cambodia.",
    icon: "map-pin",
  },
  {
    title: "Can I explore destinations by province?",
    description:
      "Yes. Users can browse travel destinations organized by each province in Cambodia.",
    icon: "credit-card",
  },
  {
    title: "Can I save my favorite destinations?",
    description:
      "Yes. Users can add places they like to their favorites and view them later.",
    icon: "rocket-launch",
  },
  {
    title: "Where can I find information about a destination?",
    description:
      "Each destination has a brief description with useful information about the place.",
    icon: "shield-check",
  },
  {
    title: "Can I see reviews of each destination?",
    description:
      "Yes. Users can view reviews and see what other visitors think about a destination.",
    icon: "map-pin",
  },
  {
    title: "How can I find a destination I want to visit?",
    description:
      "Users can browse the destinations or explore them by province to find places they are interested in.",
    icon: "document-text",
  },
];

function Question() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-10 sm:py-16 font-poppins">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <p className="text-lg sm:text-2xl font-bold uppercase tracking-[0.15em] sm:tracking-[0.3em] text-green-800/80">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.article
                key={faq.title}
                initial={false}
                className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-4 sm:p-6 text-left focus:outline-none gap-3"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-green-100 text-green-800 shadow-sm">
                      {faq.icon === "briefcase" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <path d="M6 7V6a2 2 0 012-2h8a2 2 0 012 2v1h3a1 1 0 011 1v11a2 2 0 01-2 2H4a2 2 0 01-2-2V8a1 1 0 011-1h3zm2-1h8v1H8V6zm10 3H6v9h12V9z" />
                        </svg>
                      )}
                      {faq.icon === "credit-card" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <path d="M4 7a3 3 0 00-3 3v7a3 3 0 003 3h16a3 3 0 003-3V10a3 3 0 00-3-3H4zm0 2h16a1 1 0 011 1v2H3V10a1 1 0 011-1zm0 7v-3h16v3a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                        </svg>
                      )}
                      {faq.icon === "rocket-launch" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <path d="M12.6 3.2a1 1 0 00-1.4 0l-3.5 3.5a1 1 0 00-.3.7v3.9a8.07 8.07 0 00-5.4 5.4h3.9a1 1 0 00.7-.3l3.5-3.5a1 1 0 000-1.4l-1.4-1.4 3.5-3.5 1.4 1.4a1 1 0 001.4 0l3.5-3.5a1 1 0 000-1.4l-2.5-2.5zm-3.5 7.8L8 11.1 4.9 14.2a6.05 6.05 0 003.4 3.4L8.9 16h1.9l3.3-3.3-4-4z" />
                        </svg>
                      )}
                      {faq.icon === "shield-check" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <path d="M12 2l8 3v5c0 5.25-3.84 9.82-8 10-4.16-.18-8-4.75-8-10V5l8-3zm2.7 7.7l-3.29 3.3-1.71-1.7a1 1 0 10-1.42 1.42l2.42 2.42a1 1 0 001.42 0l4-4a1 1 0 10-1.42-1.42z" />
                        </svg>
                      )}
                      {faq.icon === "map-pin" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                        </svg>
                      )}
                      {faq.icon === "document-text" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8.83a2 2 0 00-.59-1.42l-3.83-3.83A2 2 0 0014.17 3H6zm8 1.5L18.5 8H14a1 1 0 01-1-1V3.5zM8 12h8v1H8v-1zm0 3h6v1H8v-1z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm sm:text-lg font-semibold text-slate-900 leading-snug">
                      {faq.title}
                    </span>
                  </div>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-500 shrink-0 ml-2 sm:ml-4"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 sm:pl-[4.5rem] sm:pr-12 text-xs sm:text-base leading-relaxed text-gray-600 border-t border-gray-100 pt-4">
                        {faq.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Question;
