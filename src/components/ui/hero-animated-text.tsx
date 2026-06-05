import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroAnimatedTextProps {
  name?: string;
  rotatingWords?: string[];
  tail?: string;
}

export default function HeroAnimatedText({
  name = "MUHAMMAD AHMED",
  rotatingWords = ["Digital Experiences", "Brand Identities", "Interactive Stories"],
  tail = "that resonate.",
}: HeroAnimatedTextProps) {
  const [wordIdx, setWordIdx] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showRotator, setShowRotator] = useState(false);
  const [showTail, setShowTail] = useState(false);

  const greeting = "Hi, I'm ";
  const greetingChars = greeting.split("");
  const nameChars = name.split("");
  const allChars = [...greetingChars, ...nameChars];

  // greeting starts at delay 0.8s, each char 0.03s stagger
  const charBaseDelay = 0.8;
  const charStagger = 0.03;
  const charsTotal = charBaseDelay + allChars.length * charStagger + 0.4;

  useEffect(() => {
    const t1 = setTimeout(() => setShowCursor(true), charsTotal * 1000);
    const t2 = setTimeout(() => setShowSecondLine(true), (charsTotal + 1.5) * 1000);
    const t3 = setTimeout(() => setShowRotator(true), (charsTotal + 2.2) * 1000);
    const t4 = setTimeout(() => setShowTail(true), (charsTotal + 2.2) * 1000 + rotatingWords.length * 2500 + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [charsTotal, rotatingWords.length]);

  useEffect(() => {
    if (!showRotator) return;
    const id = setInterval(() => {
      setWordIdx((i) => (i + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(id);
  }, [showRotator, rotatingWords.length]);

  return (
    <div
      className="relative inline-block rounded-2xl px-5 py-6 md:px-7 md:py-8 max-w-[560px]"
      style={{
        background: "rgba(12, 12, 12, 0.45)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(215,226,234,0.12)",
        fontFamily:
          "'Space Grotesk', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
        color: "#F5F7F9",
      }}
    >
      {/* Line 1: Hi, I'm NAME with blinking cursor */}
      <h2
        className="font-extrabold tracking-tight leading-[1.05]"
        style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)" }}
      >
        {greetingChars.map((c, i) => (
          <motion.span
            key={`g-${i}`}
            initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.45,
              delay: charBaseDelay + i * charStagger,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {c}
          </motion.span>
        ))}
        <span style={{ color: "#BBCCD7" }}>
          {nameChars.map((c, i) => (
            <motion.span
              key={`n-${i}`}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.45,
                delay: charBaseDelay + (greetingChars.length + i) * charStagger,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {c}
            </motion.span>
          ))}
        </span>
        {showCursor && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              display: "inline-block",
              marginLeft: 2,
              color: "#D7E2EA",
              fontWeight: 300,
            }}
          >
            |
          </motion.span>
        )}
      </h2>

      {/* Line 2: I craft */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={showSecondLine ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 font-medium"
        style={{
          fontSize: "clamp(1.05rem, 2vw, 1.5rem)",
          color: "#D7E2EA",
        }}
      >
        I craft
      </motion.p>

      {/* Rotating words */}
      <div
        className="mt-1 relative overflow-hidden"
        style={{ height: "clamp(2.2rem, 4.5vw, 3.4rem)" }}
      >
        <AnimatePresence mode="wait">
          {showRotator && (
            <motion.span
              key={wordIdx}
              initial={{ y: 30, opacity: 0, filter: "blur(3px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -20, opacity: 0, filter: "blur(2px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)",
                background:
                  "linear-gradient(180deg, #FFFFFF 0%, #BBCCD7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {rotatingWords[wordIdx]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Tail */}
      <motion.p
        initial={{ opacity: 0, x: -40 }}
        animate={showTail ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="mt-3 font-semibold italic"
        style={{
          fontSize: "clamp(1.05rem, 2vw, 1.5rem)",
          color: "#D7E2EA",
        }}
      >
        {tail}
      </motion.p>
    </div>
  );
}
