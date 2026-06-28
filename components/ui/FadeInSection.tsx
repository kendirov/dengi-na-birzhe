"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/format";

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export function FadeInSection({
  children,
  className,
  delay = 0,
  id,
}: FadeInSectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay }}
    >
      {children}
    </motion.div>
  );
}
