"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ParallaxImageProps = { src: string; alt: string; sizes: string; priority?: boolean };

export function ParallaxImage({ src, alt, sizes, priority = false }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [34, -34]);
  return (
    <div className="parallax-image" ref={ref}>
      <motion.div className="parallax-image__layer" style={{ y }}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} />
      </motion.div>
    </div>
  );
}
