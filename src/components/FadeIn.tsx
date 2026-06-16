"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.6,
  className,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px 0px" });

  const initial: Record<string, number> = { opacity: 0 };
  if (direction === "up")    initial.y = distance;
  if (direction === "down")  initial.y = -distance;
  if (direction === "left")  initial.x = distance;
  if (direction === "right") initial.x = -distance;

  const animate = inView
    ? { opacity: 1, y: 0, x: 0 }
    : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delayStart = 0,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayStart?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: delayStart } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
