"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CountUp({ value }: { value: string }) {
  const target = Number.parseInt(value, 10);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(Number.isFinite(target) ? (reduceMotion ? target : 0) : 0);

  useEffect(() => {
    if (!inView || !Number.isFinite(target)) return;
    if (reduceMotion) {
      setCurrent(target);
      return;
    }
    const controls = animate(0, target, { duration: 1.2, ease: "easeOut", onUpdate: (next) => setCurrent(Math.round(next)) });
    return () => controls.stop();
  }, [inView, reduceMotion, target]);

  if (!Number.isFinite(target)) return <strong ref={ref} className="about-metric__value">{value}</strong>;
  return <strong ref={ref} className="about-metric__value">{String(current).padStart(value.length, "0")}<sup>+</sup></strong>;
}
