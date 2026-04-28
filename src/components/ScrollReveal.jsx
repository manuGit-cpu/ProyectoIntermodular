import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

function useConsultaMedios(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const manejarCambio = () => setMatches(mediaQuery.matches);

    manejarCambio();
    mediaQuery.addEventListener("change", manejarCambio);

    return () => mediaQuery.removeEventListener("change", manejarCambio);
  }, [query]);

  return matches;
}

function RevelarAlDesplazar({
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
  const isMobile = useConsultaMedios("(max-width: 640px)");
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

export default RevelarAlDesplazar;
