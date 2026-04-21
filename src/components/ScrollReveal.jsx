import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function ScrollReveal({
  children,
  as = "div",
  className = "",
  delay = 0,
  x = 0,
  y = 0,
  mobileX,
  mobileY,
  once = true,
  amount = 0.18,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const MotionTag = motion[as] ?? motion.div;
  const initialX = isMobile && mobileX !== undefined ? mobileX : x;
  const initialY = isMobile && mobileY !== undefined ? mobileY : y;

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? false : { opacity: 0, x: initialX, y: initialY }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

export default ScrollReveal;
